from fastapi import APIRouter, Query, HTTPException
from typing import List
from functions.skill_forecasting import forecast_all_skills, df

router = APIRouter()

@router.get("/forecast-skills", tags=["Skill Forecasting"])
async def get_forecasted_skills(
    role: str = Query(..., description="Job role (e.g., Web Developer)"), 
    top_n: int = Query(5, description="Number of top skills to return")
):
    try:
        top_skills = forecast_all_skills(df, role.lower(), months_ahead=6)
        formatted_skills = [{"skill": skill, "predicted_mentions": round(score)} 
                          for skill, score in top_skills[:top_n]]
        
        return {
            "role": role,
            "months_ahead": 6,
            "top_skills": formatted_skills
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))