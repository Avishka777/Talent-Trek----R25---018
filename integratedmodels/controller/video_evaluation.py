from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from functions.video_evaluation import (
    download_video,
    extract_audio_from_video,
    try_multiple_recognizers,
    select_best_transcription,
    evaluate_answer,
    cleanup_files
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class VideoEvaluationRequest(BaseModel):
    video_link: str
    question: Optional[str] = None
    ideal_answer: Optional[str] = None

class TranscriptionResult(BaseModel):
    engine: str
    transcription: str
    confidence: float

class EvaluationResponse(BaseModel):
    question: str
    ideal_answer: str
    score: float
    candidate_answer: str
    recognition_engine: str
    detailed_metrics: dict
    all_transcriptions: List[TranscriptionResult]

@router.post("/evaluate-video", response_model=EvaluationResponse)
async def evaluate_video(request: VideoEvaluationRequest):
    """Endpoint to evaluate a video response"""
    question = request.question or "Tell me about yourself."
    ideal_answer = request.ideal_answer or """I am a software engineer with experience in full-stack development.
    I have worked with React, Node.js, and Python. I enjoy problem-solving and working in team environments."""
    
    if not request.video_link or not isinstance(request.video_link, str):
        raise HTTPException(status_code=400, detail="Invalid video URL")

    video_path = "temp_video.mp4"
    audio_path = "temp_audio.wav"
    
    try:
        if not download_video(request.video_link, video_path):
            raise HTTPException(status_code=400, detail="Video download failed")

        if not extract_audio_from_video(video_path, audio_path):
            raise HTTPException(status_code=500, detail="Audio extraction failed")

        transcriptions = try_multiple_recognizers(audio_path)
        engine, best_transcription = select_best_transcription(transcriptions)
        
        logger.info(f"All transcriptions: {transcriptions}")
        logger.info(f"Selected transcription: {best_transcription} (engine: {engine})")
        
        score, metrics = evaluate_answer(best_transcription, ideal_answer)
        
        return EvaluationResponse(
            question=question,
            ideal_answer=ideal_answer,
            score=score,
            candidate_answer=best_transcription,
            recognition_engine=engine,
            detailed_metrics=metrics,
            all_transcriptions=[
                TranscriptionResult(engine=t[0], transcription=t[1], confidence=t[2])
                for t in transcriptions
            ]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    finally:
        cleanup_files(video_path, audio_path)