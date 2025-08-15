from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from controller.resume_job_matcher import router as matching_router
from controller.skill_assessment import assessment_router as skill_assessment_router
from controller.skill_forecasting import router as forecasting_router
from controller.video_evaluation import router as video_router
from controller.video_confidence import router as confidence_router
import uvicorn
import logging

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include endpoints from both routers
app.include_router(matching_router, prefix="/api/matching", tags=["Resume Job Matching"])
app.include_router(skill_assessment_router, prefix="/assessments", tags=["Skill Assessments"])
app.include_router(forecasting_router, prefix="/api/forecasting", tags=["Skill Forecasting"])
# app.include_router(video_router, prefix="/api/video", tags=["Video Evaluation"])
# app.include_router(confidence_router, prefix="/api/confidence", tags=["Video Confidence Evaluation"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)