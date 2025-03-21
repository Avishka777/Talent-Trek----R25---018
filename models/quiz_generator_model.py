from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import openai

load_dotenv()  
app = FastAPI()

openai.api_key = os.getenv("OPENAI_API_KEY")

class GenerateQuestionsRequest(BaseModel):
    job_description: str

@app.post("/generate-questions/")
async def generate_questions_endpoint(request: GenerateQuestionsRequest):
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates technical interview questions."},
                {"role": "user", "content": f"Generate 5 technical interview questions for this job description: {request.job_description}"}
            ],
            max_tokens=300
        )

        questions_text = response.choices[0].message.content
        questions = [q.strip() for q in questions_text.split('\n') if q.strip()]
        return {"questions": questions}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
