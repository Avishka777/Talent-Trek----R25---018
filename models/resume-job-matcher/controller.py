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
from pydantic import BaseModel
from typing import Optional

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

# Create API Router instance
router = APIRouter()

# ----------------------
# Request Models
# ----------------------
class CustomWeights(BaseModel):
    experience_score: Optional[float] = 0.25
    skills_score: Optional[float] = 0.25
    profession_score: Optional[float] = 0.15
    summary_score: Optional[float] = 0.35

class MatchJobsRequest(BaseModel):
    resume_id: str
    weights: Optional[CustomWeights] = None

class MatchResumesRequest(BaseModel):
    job_id: str
    weights: Optional[CustomWeights] = None

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

def match_resume_to_job(user: dict, job: dict, weights: dict = None) -> dict:
    """
    Computes matching scores between a user's resume and a job document based on:
      1. Experience
      2. Skills
      3. Profession
      4. Summary (user's summary combined with qualifications)
    
    Default weights (if not customized) are:
      - Experience: 0.25
      - Skills: 0.25
      - Profession: 0.15
      - Summary: 0.35
    """
    default_weights = {
        "experience": 0.25,
        "skills": 0.25,
        "profession": 0.15,
        "summary": 0.35
    }
    # If custom weights are provided, update defaults using mapping from custom keys.
    if weights:
        default_weights.update({
            "experience": weights.experience_score if weights.experience_score is not None else default_weights["experience"],
            "skills": weights.skills_score if weights.skills_score is not None else default_weights["skills"],
            "profession": weights.profession_score if weights.profession_score is not None else default_weights["profession"],
            "summary": weights.summary_score if weights.summary_score is not None else default_weights["summary"],
        })

    # Experience Score
    required_experience = parse_experience(job.get('workExperience', '0'))
    user_experience = user.get('totalExperienceYears', 0)
    experience_score = 100 if user_experience >= required_experience and required_experience > 0 else (
        user_experience / required_experience * 100 if required_experience > 0 else 100)

    # Skills Score
    job_skills = [skill.lower() for skill in job.get('skills', [])]
    user_skills = [skill.lower() for skill in user.get('skills', [])]
    if job_skills:
        matching_skills = set(job_skills) & set(user_skills)
        skills_score = (len(matching_skills) / len(job_skills)) * 100
    else:
        skills_score = 100

    # Profession Score using BERT-based similarity
    profession_similarity = calculate_bert_similarity(user.get('profession', ""), job.get('jobTitle', ""))
    profession_score = profession_similarity * 100

    # Summary Score: combine user's summary with qualifications text
    combined_user_text = (user.get('summary', "") + " " + get_qualification_text(user)).strip()
    summary_similarity = calculate_bert_similarity(combined_user_text, job.get('jobDescription', ""))
    summary_score = summary_similarity * 100

    overall_score = (
        experience_score * default_weights["experience"] +
        skills_score * default_weights["skills"] +
        profession_score * default_weights["profession"] +
        summary_score * default_weights["summary"]
    )

    return {
        "job_id": str(job.get("_id")),
        "jobTitle": job.get("jobTitle", ""),
        "companyName": job.get("companyName", ""),
        "experience_score": round(experience_score, 2),
        "skills_score": round(skills_score, 2),
        "profession_score": round(profession_score, 2),
        "summary_score": round(summary_score, 2),
        "overall_match_percentage": round(overall_score, 2)
    }

def match_resume_to_job_normal(user: dict, job: dict, weights: dict = None) -> dict:
    """
    Computes matching scores between a resume and a job using a simple text matching approach.
    Uses combined user text (summary + qualifications) against job description for summary matching.
    Default weights are:
      - Experience: 0.25
      - Skills: 0.25
      - Profession: 0.15
      - Summary: 0.35
    """
    default_weights = {
        "experience": 0.25,
        "skills": 0.25,
        "profession": 0.15,
        "summary": 0.35
    }
    if weights:
        default_weights.update({
            "experience": weights.experience_score if weights.experience_score is not None else default_weights["experience"],
            "skills": weights.skills_score if weights.skills_score is not None else default_weights["skills"],
            "profession": weights.profession_score if weights.profession_score is not None else default_weights["profession"],
            "summary": weights.summary_score if weights.summary_score is not None else default_weights["summary"],
        })

    # Experience Score
    required_experience = parse_experience(job.get('workExperience', '0'))
    user_experience = user.get('totalExperienceYears', 0)
    experience_score = 100 if user_experience >= required_experience and required_experience > 0 else (
        user_experience / required_experience * 100 if required_experience > 0 else 100)

    # Skills Score
    job_skills = [skill.lower() for skill in job.get('skills', [])]
    user_skills = [skill.lower() for skill in user.get('skills', [])]
    if job_skills:
        matching_skills = set(job_skills) & set(user_skills)
        skills_score = (len(matching_skills) / len(job_skills)) * 100
    else:
        skills_score = 100

    # Profession Score using simple text matching
    profession_similarity = simple_similarity(user.get('profession', ""), job.get('jobTitle', ""))
    profession_score = profession_similarity * 100

    # Summary Score using simple text matching
    combined_user_text = (user.get('summary', "") + " " + get_qualification_text(user)).strip()
    summary_similarity = simple_similarity(combined_user_text, job.get('jobDescription', ""))
    summary_score = summary_similarity * 100

    overall_score = (
        experience_score * default_weights["experience"] +
        skills_score * default_weights["skills"] +
        profession_score * default_weights["profession"] +
        summary_score * default_weights["summary"]
    )

    return {
        "job_id": str(job.get("_id")),
        "jobTitle": job.get("jobTitle", ""),
        "companyName": job.get("companyName", ""),
        "overall_match_percentage": round(overall_score, 2)
    }

# ----------------------
# Endpoints using POST
# ----------------------
@router.post("/match-jobs")
async def match_jobs_endpoint(request: MatchJobsRequest):
    """
    Given a resume ID and optional custom weights, compute and return matching percentages for all jobs using the BERT-based approach.
    """
    resume = resume_collection.find_one({"_id": ObjectId(request.resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    jobs_cursor = job_collection.find()
    jobs = list(jobs_cursor)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")
    
    # If custom weights are provided, convert them to our matching function keys.
    custom_weights = None
    if request.weights:
        custom_weights = {
            "experience_score": request.weights.experience_score,
            "skills_score": request.weights.skills_score,
            "profession_score": request.weights.profession_score,
            "summary_score": request.weights.summary_score
        }
    
    results = [match_resume_to_job(resume, job, weights=request.weights) for job in jobs]
    results_sorted = sorted(results, key=lambda x: x["overall_match_percentage"], reverse=True)
    return {"matches": results_sorted}

@router.post("/match-resumes")
async def match_resumes_endpoint(request: MatchResumesRequest):
    """
    Given a job ID and optional custom weights, fetch the job document and compute matching percentages for all available resumes.
    Returns detailed matching information including candidate details.
    """
    job = job_collection.find_one({"_id": ObjectId(request.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    resumes_cursor = resume_collection.find()
    resumes = list(resumes_cursor)
    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found")
    
    users_collection = db["users"]
    matches = []
    for resume in resumes:
        match_data = match_resume_to_job(resume, job, weights=request.weights)
        match_data.pop("job_id", None)
        match_data.pop("jobTitle", None)
        match_data.pop("companyName", None)
        
        user_id = resume.get("userId")
        if user_id:
            user = users_collection.find_one({"_id": user_id})
            full_name = user.get("fullName") if user else ""
            user_email = user.get("email") if user else ""
        else:
            full_name = ""
            user_email = ""
        
        match_data["resume_id"] = str(resume.get("_id"))
        match_data["resume_name"] = full_name
        match_data["email"] = user_email
        match_data["totalExperienceYears"] = resume.get("totalExperienceYears", 0)
        match_data["profession"] = resume.get("profession", "")
        match_data["fileUrl"] = resume.get("fileUrl", "")
        
        matches.append(match_data)
    
    matches_sorted = sorted(matches, key=lambda x: x["overall_match_percentage"], reverse=True)
    return {"matches": matches_sorted}

@router.get("/plot-matching-comparison-graph/{resume_id}")
async def plot_matching_comparison_graph(resume_id: str):
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
    
    job_ids = []
    bert_scores = []
    normal_scores = []
    
    for job in jobs:
        bert_result = match_resume_to_job(resume, job)
        normal_result = match_resume_to_job_normal(resume, job)
        bert_scores.append(bert_result["overall_match_percentage"])
        normal_scores.append(normal_result["overall_match_percentage"])
        job_ids.append(str(job.get("_id"))[:15])
    
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.plot(job_ids, bert_scores, marker='o', label="BERT Matching")
    ax.plot(job_ids, normal_scores, marker='o', label="Normal Text Matching")
    ax.set_title("Overall Matching Comparison (BERT vs. Normal)")
    ax.set_xlabel("Job (partial ID)")
    ax.set_ylabel("Overall Match Percentage")
    ax.legend()
    ax.set_xticks(range(len(job_ids)))
    ax.set_xticklabels(job_ids, rotation=45)
    
    buf = BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")

@router.get("/plot-matching-comparison-table/{resume_id}")
async def plot_matching_comparison_table(resume_id: str):
    """
    Retrieves a resume and all jobs from MongoDB, computes overall matching percentages using:
      - BERT-based matching
      - Simple (normal) text matching
    Generates a table showing:
      - Job ID
      - Job Title
      - BERT Matching Score
      - Normal Matching Score
      - Difference between the scores.
    """
    resume = resume_collection.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    jobs_cursor = job_collection.find()
    jobs = list(jobs_cursor)
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")
    
    job_ids = []
    job_titles = []
    bert_scores = []
    normal_scores = []
    
    for job in jobs:
        bert_result = match_resume_to_job(resume, job)
        normal_result = match_resume_to_job_normal(resume, job)
        bert_scores.append(bert_result["overall_match_percentage"])
        normal_scores.append(normal_result["overall_match_percentage"])
        job_ids.append(str(job.get("_id"))[:15])
        job_titles.append(job.get("jobTitle", ""))
    
    diff_scores = [round(bert - normal, 2) for bert, normal in zip(bert_scores, normal_scores)]
    
    table_data = []
    for i in range(len(job_ids)):
        table_data.append([job_ids[i], job_titles[i], bert_scores[i], normal_scores[i], diff_scores[i]])
    
    fig, ax = plt.subplots(figsize=(10, len(job_ids)*0.5 + 2))
    ax.axis('tight')
    ax.axis('off')
    
    table = ax.table(cellText=table_data,
                     colLabels=["Job ID", "Job Title", "BERT Score", "Normal Score", "Difference"],
                     loc='center',
                     cellLoc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(10)
    
    buf = BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")
