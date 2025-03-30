from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from bson import ObjectId
import uvicorn
import pymongo
from pymongo import MongoClient
import re
import numpy as np
import torch
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity

# ----------------------
# FastAPI Initialization
# ----------------------
app = FastAPI()

# Enable CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------
# MongoDB Connection
# ----------------------
MONGO_URI = "mongodb+srv://avishkwork:avishkwork@talent-trek.bodnu.mongodb.net/?retryWrites=true&w=majority&appName=TALENT-TREK"
client = MongoClient(MONGO_URI)
db = client["test"]  # Use your actual database name here
resume_collection = db["resumes"]  # Resumes collection (user details)
job_collection = db["jobs"]        # Jobs collection

# ----------------------
# Initialize BERT Model for Text Similarity
# ----------------------
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

def get_bert_embeddings(text: str):
    """
    Returns a 768-dimension BERT embedding for the given text.
    If the text is empty, returns a zero vector.
    """
    if not text:
        return np.zeros(768)
    inputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

def calculate_bert_similarity(text1: str, text2: str) -> float:
    """
    Calculates cosine similarity between two texts using their BERT embeddings.
    Returns a float value between 0 and 1.
    """
    emb1 = get_bert_embeddings(text1)
    emb2 = get_bert_embeddings(text2)
    sim = cosine_similarity([emb1], [emb2])
    return sim[0][0]

def parse_experience(exp_str: str) -> float:
    """
    Parses a string like "3+ years" or "1+ years" and returns the numeric value (e.g., 3 or 1).
    If parsing fails, returns 0.
    """
    try:
        numbers = re.findall(r'\d+\.?\d*', exp_str)
        if numbers:
            return float(numbers[0])
    except Exception:
        pass
    return 0

def get_qualification_text(user: dict) -> str:
    """
    Combines the textual content from the user's educations, trainingsAndCertifications,
    and professionalExperiences fields.
    """
    parts = []
    # For educations, use the "description" field if available
    if user.get('educations'):
        parts += [edu.get('description', '') for edu in user['educations'] if edu.get('description')]
    # For certifications/trainings
    if user.get('trainingsAndCertifications'):
        parts += [cert.get('description', '') for cert in user['trainingsAndCertifications'] if cert.get('description')]
    # For professional experiences
    if user.get('professionalExperiences'):
        parts += [exp.get('description', '') for exp in user['professionalExperiences'] if exp.get('description')]
    return " ".join(parts)

def get_job_qualification_text(job: dict) -> str:
    """
    Joins the job's qualifications array into a single string.
    """
    if job.get('qualifications'):
        return " ".join(job['qualifications'])
    return ""

def match_resume_to_job(user: dict, job: dict) -> dict:
    """
    Computes matching scores between a user's resume and a job document based on:
      1. Experience
      2. Skills
      3. Profession
      4. Summary vs. Job Description
      5. Qualifications vs. User's educations, certifications, and experiences

    The matching scores are computed as percentages and then combined
    into a final overall matching percentage.
    """

    # 1. Experience Match:
    # Parse required experience from job.workExperience (e.g., "3+ years" -> 3)
    required_experience = parse_experience(job.get('workExperience', '0'))
    user_experience = user.get('totalExperienceYears', 0)
    # If user has equal or higher experience, score is 100; else, proportional score.
    experience_score = 100 if user_experience >= required_experience and required_experience > 0 else (user_experience / required_experience * 100 if required_experience > 0 else 100)

    # 2. Skills Match:
    # Compare user.skills with job.skills (case-insensitive)
    job_skills = [skill.lower() for skill in job.get('skills', [])]
    user_skills = [skill.lower() for skill in user.get('skills', [])]
    if job_skills:
        matching_skills = set(job_skills) & set(user_skills)
        skills_score = (len(matching_skills) / len(job_skills)) * 100
    else:
        skills_score = 100  # If no required skills listed, assume full match

    # 3. Profession Match:
    # Compare user.profession with job.jobTitle using BERT similarity.
    profession_similarity = calculate_bert_similarity(user.get('profession', ""), job.get('jobTitle', ""))
    profession_score = profession_similarity * 100

    # 4. Summary Match:
    # Compare user.summary with job.jobDescription using BERT similarity.
    summary_similarity = calculate_bert_similarity(user.get('summary', ""), job.get('jobDescription', ""))
    summary_score = summary_similarity * 100

    # 5. Qualifications Match:
    # Combine user's educations, certifications, and professional experiences into one string.
    user_qual_text = get_qualification_text(user)
    # For job, join the qualifications list.
    job_qual_text = get_job_qualification_text(job)
    qual_similarity = calculate_bert_similarity(user_qual_text, job_qual_text)
    qual_score = qual_similarity * 100

    # Weights for each category (adjust as needed)
    weight_experience = 0.25
    weight_skills = 0.25
    weight_profession = 0.15
    weight_summary = 0.20
    weight_qualifications = 0.15

    overall_score = (experience_score * weight_experience +
                     skills_score * weight_skills +
                     profession_score * weight_profession +
                     summary_score * weight_summary +
                     qual_score * weight_qualifications)

    return {
        "job_id": str(job.get("_id")),
        "jobTitle": job.get("jobTitle", ""),
        "companyName": job.get("companyName", ""),
        "experience_score": round(experience_score, 2),
        "skills_score": round(skills_score, 2),
        "profession_score": round(profession_score, 2),
        "summary_score": round(summary_score, 2),
        "qualifications_score": round(qual_score, 2),
        "overall_match_percentage": round(overall_score, 2)
    }

def match_job_to_resume(job: dict, user: dict) -> dict:
    """
    Computes matching scores between a job document and a user's resume.
    This is simply the inverse of match_resume_to_job.
    """
    result = match_resume_to_job(user, job)
    # For clarity, include user ID and name details.
    result["resume_id"] = str(user.get("_id"))
    result["applicant"] = f"{user.get('firstName', '')} {user.get('lastName', '')}"
    return result

# ----------------------
# Endpoints
# ----------------------

@app.get("/match-jobs/{resume_id}")
async def get_matching_jobs(resume_id: str):
    """
    Given a resume ID, fetch the resume document and compute matching percentages
    for all available jobs. Returns a list of jobs sorted by overall match percentage (descending).

    Field mappings:
      - users.totalExperienceYears vs. jobs.workExperience
      - users.skills vs. jobs.skills
      - users.profession vs. jobs.jobTitle
      - users.summary vs. jobs.jobDescription
      - Combined users.educations, trainingsAndCertifications, and professionalExperiences vs. jobs.qualifications
    """
    # Retrieve resume from DB
    resume = resume_collection.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Retrieve all jobs
    jobs_cursor = job_collection.find()
    jobs = list(jobs_cursor)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")

    # Compute match scores for each job
    results = [match_resume_to_job(resume, job) for job in jobs]
    # Sort descending by overall_match_percentage
    results_sorted = sorted(results, key=lambda x: x["overall_match_percentage"], reverse=True)
    return {"matches": results_sorted}

@app.get("/match-resumes/{job_id}")
async def get_matching_resumes(job_id: str):
    """
    Given a job ID, fetch the job document and compute matching percentages
    for all available resumes. Returns a list of resumes sorted by overall match percentage (descending).

    Field mappings (same as above, but in reverse):
      - users.totalExperienceYears vs. jobs.workExperience
      - users.skills vs. jobs.skills
      - users.profession vs. jobs.jobTitle
      - users.summary vs. jobs.jobDescription
      - Combined users.educations, trainingsAndCertifications, and professionalExperiences vs. jobs.qualifications
    """
    # Retrieve job from DB
    job = job_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Retrieve all resumes
    resumes_cursor = resume_collection.find()
    resumes = list(resumes_cursor)
    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found")

    # Compute match scores for each resume
    results = [match_job_to_resume(job, resume) for resume in resumes]
    results_sorted = sorted(results, key=lambda x: x["overall_match_percentage"], reverse=True)
    return {"matches": results_sorted}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
