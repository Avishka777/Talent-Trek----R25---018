from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
import re
import numpy as np
import torch
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity
import matplotlib.pyplot as plt
from io import BytesIO
from difflib import SequenceMatcher
import pymongo
from pymongo import MongoClient

# ----------------------
# MongoDB Connection
# ----------------------
MONGO_URI = "mongodb+srv://avishkwork:avishkwork@talent-trek.bodnu.mongodb.net/?retryWrites=true&w=majority&appName=TALENT-TREK"
client = MongoClient(MONGO_URI)
db = client["test"] 
resume_collection = db["resumes"]
job_collection = db["jobs"]       

# ----------------------
# Initialize BERT Model for Text Similarity
# ----------------------
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

# Create API Router instance
router = APIRouter()

# ----------------------
# Helper Functions
# ----------------------
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

def simple_similarity(text1: str, text2: str) -> float:
    """
    Returns a simple similarity ratio between two texts using difflib.
    Ratio is between 0 and 1.
    """
    return SequenceMatcher(None, text1, text2).ratio()

def parse_experience(exp_str: str) -> float:
    """
    Parses a string like "3+ years" or "1+ years" and returns the numeric value.
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
    Combines textual content from the user's educations, trainingsAndCertifications,
    and professionalExperiences fields.
    """
    parts = []
    if user.get('educations'):
        parts += [edu.get('description', '') for edu in user['educations'] if edu.get('description')]
    if user.get('trainingsAndCertifications'):
        parts += [cert.get('description', '') for cert in user['trainingsAndCertifications'] if cert.get('description')]
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
    """
    required_experience = parse_experience(job.get('workExperience', '0'))
    user_experience = user.get('totalExperienceYears', 0)
    experience_score = 100 if user_experience >= required_experience and required_experience > 0 else (
        user_experience / required_experience * 100 if required_experience > 0 else 100)

    job_skills = [skill.lower() for skill in job.get('skills', [])]
    user_skills = [skill.lower() for skill in user.get('skills', [])]
    if job_skills:
        matching_skills = set(job_skills) & set(user_skills)
        skills_score = (len(matching_skills) / len(job_skills)) * 100
    else:
        skills_score = 100

    profession_similarity = calculate_bert_similarity(user.get('profession', ""), job.get('jobTitle', ""))
    profession_score = profession_similarity * 100

    summary_similarity = calculate_bert_similarity(user.get('summary', ""), job.get('jobDescription', ""))
    summary_score = summary_similarity * 100

    user_qual_text = get_qualification_text(user)
    job_qual_text = get_job_qualification_text(job)
    qual_similarity = calculate_bert_similarity(user_qual_text, job_qual_text)
    qual_score = qual_similarity * 100

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

def match_resume_to_job_normal(user: dict, job: dict) -> dict:
    """
    Computes matching scores between a resume and a job using a simple text matching approach
    (without BERT) for text fields. Experience and skills matching remain the same.
    """
    required_experience = parse_experience(job.get('workExperience', '0'))
    user_experience = user.get('totalExperienceYears', 0)
    experience_score = 100 if user_experience >= required_experience and required_experience > 0 else (
        user_experience / required_experience * 100 if required_experience > 0 else 100)

    job_skills = [skill.lower() for skill in job.get('skills', [])]
    user_skills = [skill.lower() for skill in user.get('skills', [])]
    if job_skills:
        matching_skills = set(job_skills) & set(user_skills)
        skills_score = (len(matching_skills) / len(job_skills)) * 100
    else:
        skills_score = 100

    profession_similarity = simple_similarity(user.get('profession', ""), job.get('jobTitle', ""))
    profession_score = profession_similarity * 100

    summary_similarity = simple_similarity(user.get('summary', ""), job.get('jobDescription', ""))
    summary_score = summary_similarity * 100

    user_qual_text = get_qualification_text(user)
    job_qual_text = get_job_qualification_text(job)
    qual_similarity = simple_similarity(user_qual_text, job_qual_text)
    qual_score = qual_similarity * 100

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
        "overall_match_percentage": round(overall_score, 2)
    }

# ----------------------
# Endpoints
# ----------------------
@router.get("/match-jobs/{resume_id}")
async def get_matching_jobs(resume_id: str):
    """
    Given a resume ID, compute and return matching percentages for all jobs using BERT.
    """
    resume = resume_collection.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    jobs_cursor = job_collection.find()
    jobs = list(jobs_cursor)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")
    results = [match_resume_to_job(resume, job) for job in jobs]
    results_sorted = sorted(results, key=lambda x: x["overall_match_percentage"], reverse=True)
    return {"matches": results_sorted}

@router.get("/match-resumes/{job_id}")
async def get_matching_resumes(job_id: str):
    """
    Given a job ID, fetch the job document and compute matching percentages
    for all available resumes. Returns a list of resumes sorted by overall match percentage (descending).
    """
    job = job_collection.find_one({"_id": ObjectId(job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    resumes_cursor = resume_collection.find()
    resumes = list(resumes_cursor)
    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found")
    results = [match_resume_to_job(resume, job) for resume in resumes]
    results_sorted = sorted(results, key=lambda x: x["overall_match_percentage"], reverse=True)
    return {"matches": results_sorted}

@router.get("/plot-matching-comparison/{resume_id}")
async def plot_matching_comparison_real(resume_id: str):
    """
    Retrieves a resume and all jobs from MongoDB, computes overall matching percentages using:
      - BERT-based matching
      - Simple (normal) text matching
    Plots a line chart comparing these two methods across the jobs.
    """
    resume = resume_collection.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    jobs_cursor = job_collection.find()
    jobs = list(jobs_cursor)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")
    
    bert_scores = []
    normal_scores = []
    job_ids = []
    
    for job in jobs:
        bert_result = match_resume_to_job(resume, job)
        normal_result = match_resume_to_job_normal(resume, job)
        bert_scores.append(bert_result["overall_match_percentage"])
        normal_scores.append(normal_result["overall_match_percentage"])
        job_ids.append(str(job.get("_id"))[:10])  # Use first 10 characters for labeling
    
    plt.figure()
    plt.plot(job_ids, bert_scores, marker='o', label="BERT Matching")
    plt.plot(job_ids, normal_scores, marker='o', label="Normal Text Matching")
    plt.title("Overall Matching Comparison (BERT vs. Normal)")
    plt.xlabel("Job (partial ID)")
    plt.ylabel("Overall Match Percentage")
    plt.legend()
    plt.xticks(rotation=45)
    
    buf = BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format="png")
    plt.close()
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
