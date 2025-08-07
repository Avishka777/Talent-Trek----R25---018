import re
import numpy as np
import torch
from transformers import BertTokenizer, BertModel
from sklearn.metrics.pairwise import cosine_similarity
from difflib import SequenceMatcher
import pymongo
from pymongo import MongoClient

# MongoDB Connection
MONGO_URI = "mongodb+srv://avishkwork:avishkwork@talent-trek.bodnu.mongodb.net/?retryWrites=true&w=majority&appName=TALENT-TREK"
client = MongoClient(MONGO_URI)
db = client["test"]
resume_collection = db["resumes"]
job_collection = db["jobs"]

# Initialize BERT Model
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

def get_bert_embeddings(text: str):
    if not text:
        return np.zeros(768)
    inputs = tokenizer(text, return_tensors='pt', padding=True, truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1).squeeze().numpy()

def calculate_bert_similarity(text1: str, text2: str) -> float:
    emb1 = get_bert_embeddings(text1)
    emb2 = get_bert_embeddings(text2)
    sim = cosine_similarity([emb1], [emb2])
    return sim[0][0]

def simple_similarity(text1: str, text2: str) -> float:
    return SequenceMatcher(None, text1, text2).ratio()

def parse_experience(exp_str: str) -> float:
    try:
        numbers = re.findall(r'\d+\.?\d*', exp_str)
        if numbers:
            return float(numbers[0])
    except Exception:
        pass
    return 0

def get_qualification_text(user: dict) -> str:
    parts = []
    if user.get('educations'):
        parts += [edu.get('description', '') for edu in user['educations'] if edu.get('description')]
    if user.get('trainingsAndCertifications'):
        parts += [cert.get('description', '') for cert in user['trainingsAndCertifications'] if cert.get('description')]
    if user.get('professionalExperiences'):
        parts += [exp.get('description', '') for exp in user['professionalExperiences'] if exp.get('description')]
    return " ".join(parts)

def get_job_qualification_text(job: dict) -> str:
    if job.get('qualifications'):
        return " ".join(job['qualifications'])
    return ""

def match_resume_to_job(user: dict, job: dict, weights: dict = None):
    default_weights = {
        "experience": 0.25,
        "skills": 0.25,
        "profession": 0.15,
        "summary": 0.35
    }
    
    if weights:
        default_weights.update({
            "experience": weights.get("experience_score", default_weights["experience"]),
            "skills": weights.get("skills_score", default_weights["skills"]),
            "profession": weights.get("profession_score", default_weights["profession"]),
            "summary": weights.get("summary_score", default_weights["summary"]),
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

    # Profession Score
    profession_similarity = calculate_bert_similarity(user.get('profession', ""), job.get('jobTitle', ""))
    profession_score = profession_similarity * 100

    # Summary Score
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

def match_resume_to_job_normal(user: dict, job: dict, weights: dict = None):
    default_weights = {
        "experience": 0.25,
        "skills": 0.25,
        "profession": 0.15,
        "summary": 0.35
    }
    
    if weights:
        default_weights.update({
            "experience": weights.get("experience_score", default_weights["experience"]),
            "skills": weights.get("skills_score", default_weights["skills"]),
            "profession": weights.get("profession_score", default_weights["profession"]),
            "summary": weights.get("summary_score", default_weights["summary"]),
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

    # Profession Score
    profession_similarity = simple_similarity(user.get('profession', ""), job.get('jobTitle', ""))
    profession_score = profession_similarity * 100

    # Summary Score
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