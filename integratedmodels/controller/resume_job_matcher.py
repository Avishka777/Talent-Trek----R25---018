from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from bson import ObjectId
import matplotlib.pyplot as plt
from io import BytesIO
from pydantic import BaseModel
from typing import Optional

from functions.resume_job_matcher import (
    match_resume_to_job,
    match_resume_to_job_normal,
    resume_collection,
    job_collection,
    db
)

router = APIRouter()

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

@router.post("/match-jobs")
async def match_jobs_endpoint(request: MatchJobsRequest):
    resume = resume_collection.find_one({"_id": ObjectId(request.resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    jobs = list(job_collection.find())
    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found")
    
    results = [match_resume_to_job(resume, job, request.weights.dict() if request.weights else None) for job in jobs]
    return {"matches": sorted(results, key=lambda x: x["overall_match_percentage"], reverse=True)}

@router.post("/match-resumes")
async def match_resumes_endpoint(request: MatchResumesRequest):
    job = job_collection.find_one({"_id": ObjectId(request.job_id)})
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    resumes = list(resume_collection.find())
    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found")
    
    users_collection = db["users"]
    matches = []
    
    for resume in resumes:
        match_data = match_resume_to_job(resume, job, request.weights.dict() if request.weights else None)
        user_id = resume.get("userId")
        user = users_collection.find_one({"_id": user_id}) if user_id else None
        
        matches.append({
            "resume_id": str(resume.get("_id")),
            "resume_name": user.get("fullName", "") if user else "",
            "email": user.get("email", "") if user else "",
            "totalExperienceYears": resume.get("totalExperienceYears", 0),
            "profession": resume.get("profession", ""),
            "fileUrl": resume.get("fileUrl", ""),
            **{k: v for k, v in match_data.items() if k not in ["job_id", "jobTitle", "companyName"]}
        })
    
    return {"matches": sorted(matches, key=lambda x: x["overall_match_percentage"], reverse=True)}

@router.get("/plot-matching-comparison-graph/{resume_id}")
async def plot_matching_comparison_graph(resume_id: str):
    resume = resume_collection.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    jobs = list(job_collection.find())
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
    resume = resume_collection.find_one({"_id": ObjectId(resume_id)})
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    jobs = list(job_collection.find())
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