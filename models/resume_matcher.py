from fastapi import FastAPI, HTTPException
import pymongo
from pymongo import MongoClient
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel
from typing import List

app = FastAPI()

# MongoDB Connection
MONGO_URI = "mongodb+srv://avishkwork:avishkwork@talent-trek.bodnu.mongodb.net/?retryWrites=true&w=majority&appName=TALENT-TREK"
client = MongoClient(MONGO_URI)
db = client["test"]  # Replace with your database name
resume_collection = db["resumes"]  # Collection for resumes
job_collection = db["jobs"]  # Collection for jobs
user_collection = db["users"]  # Collection for users

# Load vectorizer
with open("vectorizer.pkl", "rb") as f:
    vectorizer = pickle.load(f)

# Pydantic Model for Job Matching Request
class MatchJobsRequest(BaseModel):
    skills: List[str]
    profession: str
    totalExperienceYears: int
    summary: str
    educations: List[str]
    certifications: List[str]
    professionalExperiences: List[str]

@app.post("/match_jobs/")
def match_jobs(request: MatchJobsRequest):
    user_text = " ".join(
        request.skills +
        [request.profession] +
        [f"{request.totalExperienceYears} years experience"] +
        [request.summary] +
        request.educations +
        request.certifications +
        request.professionalExperiences
    )

    user_vector = vectorizer.transform([user_text])

    # Fetch jobs from MongoDB
    jobs = list(job_collection.find({}, {
        "_id": 1,
        "jobTitle": 1,
        "companyName": 1,
        "companyLogo": 1,
        "workExperience": 1,
        "skills": 1,
        "salaryRange": 1,
        "employmentType": 1,
        "createdAt": 1,
        "jobDescription": 1,
        "jobRequirements": 1,
        "qualifications": 1
    }))

    if not jobs:
        raise HTTPException(status_code=404, detail="No jobs found in the database.")

    # Prepare job descriptions for vectorization
    job_texts = [
        f"{job.get('jobDescription', '')} {job.get('jobRequirements', '')} {' '.join(job.get('skills', []))} {' '.join(job.get('qualifications', []))}"
        for job in jobs
    ]

    job_vectors = vectorizer.transform(job_texts)
    similarity_scores = cosine_similarity(user_vector, job_vectors).flatten()

    # Add match percentage to jobs
    for i, job in enumerate(jobs):
        job["match_percentage"] = float(similarity_scores[i]) * 100

    # Sort jobs by match percentage and return the top 10
    matched_jobs = sorted(jobs, key=lambda x: x["match_percentage"], reverse=True)[:10]

    return [
        {
            "_id": str(job["_id"]),  # Convert ObjectId to string
            "jobId": str(job["_id"]),  # Explicit job ID field
            "jobTitle": job["jobTitle"],
            "companyName": job.get("companyName", ""),
            "companyLogo": job.get("companyLogo", ""),
            "workExperience": job.get("workExperience", ""),
            "skills": job.get("skills", []),
            "salaryRange": job.get("salaryRange", ""),
            "employmentType": job.get("employmentType", ""),
            "createdAt": job.get("createdAt", ""),
            "match_percentage": job["match_percentage"],
        }
        for job in matched_jobs
    ]

# Pydantic model for candidate matching request
class MatchCandidatesRequest(BaseModel):
    job_title: str
    job_description: str
    job_requirements: str
    job_required_experience_years: int

@app.post("/match_candidates/")
def match_candidates(request: MatchCandidatesRequest):
    job_text = request.job_description + " " + request.job_requirements
    job_vector = vectorizer.transform([job_text])

    resumes = list(resume_collection.find({}, {"cvText": 1, "userId": 1}))
    if not resumes:
        raise HTTPException(status_code=404, detail="No resumes found in the database.")

    resume_texts = [resume["cvText"] for resume in resumes if "cvText" in resume]
    if not resume_texts:
        raise HTTPException(status_code=404, detail="No valid resume text found.")

    resume_vectors = vectorizer.transform(resume_texts)
    similarity_scores = cosine_similarity(job_vector, resume_vectors).flatten()

    for i, resume in enumerate(resumes):
        resume["match_score"] = float(similarity_scores[i]) * 100

    matched_candidates = sorted(resumes, key=lambda x: x["match_score"], reverse=True)[:10]

    result = []
    for candidate in matched_candidates:
        user = user_collection.find_one({"_id": candidate["userId"]}, {"fullName": 1})
        if user:
            result.append({
                "userId": str(candidate["userId"]),
                "fullName": user.get("fullName", "Unknown"),
                "match_score": candidate["match_score"],
            })

    return result

# Example JSON request body for /match_candidates API:
# {
#     "job_title": "Software Engineer",
#     "job_description": "Develop and maintain applications.",
#     "job_requirements": "Experience with Python and FastAPI.",
#     "job_required_experience_years": 3
# }

# Run API
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
