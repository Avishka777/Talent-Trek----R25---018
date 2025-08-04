from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from controller import assessment_router  # Changed from matching_router to assessment_router

app = FastAPI()

# Add a root endpoint
@app.get("/")
async def root():
    return {
        "message": "Skill Assessment API",
        "endpoints": {
            "generate_quiz": "/assessments/generate-quiz (POST)",
            "evaluate_quiz": "/assessments/evaluate-quiz (POST)"
        }
    }

# Enable CORS (adjust origins as needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include endpoints from the controller
app.include_router(assessment_router, prefix="/assessments", tags=["assessments"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)