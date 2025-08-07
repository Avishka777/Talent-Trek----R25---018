import cv2
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import load_model
import os
import tempfile
import urllib.request
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional, Any  # Added Any import here
import logging

# Initialize router
router = APIRouter()

# Constants
EMOTIONS = {
    0: 'Angry',
    1: 'Disgust',
    2: 'Fear',
    3: 'Happy',
    4: 'Sad',
    5: 'Surprise',
    6: 'Neutral'
}
POSITIVE_EMOTIONS = ['Happy', 'Neutral', 'Surprise']  # Fixed typo from POSITIVE_EMOTIONS
MODEL_PATH = "./model/facial_expression_model.h5"

# Configure logging
logger = logging.getLogger(__name__)

# Request/Response Models
class VideoRequest(BaseModel):
    video_url: HttpUrl
    sampling_rate: Optional[int] = 4

class BatchVideoRequest(BaseModel):
    video_urls: List[HttpUrl]
    sampling_rate: Optional[int] = 4

class EvaluationResults(BaseModel):
    processed_frames: int
    detected_faces: int
    emotion_counts: Dict[str, int]
    positive_confidence: float
    emotion_percentages: Dict[str, float]

class VideoEvaluationResponse(BaseModel):
    video_url: str
    results: EvaluationResults

class BatchVideoEvaluationResponse(BaseModel):
    video_url: str
    results: Optional[EvaluationResults] = None
    error: Optional[str] = None

# Core Evaluator Class
class VideoConfidenceEvaluator:
    def __init__(self):
        self.model = None
        self.face_cascade = None
        self._initialize_models()

    def _initialize_models(self):
        """Load the facial expression model and face detector"""
        try:
            # Load emotion recognition model
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model not found at {MODEL_PATH}")
            self.model = load_model(MODEL_PATH)
            logger.info("Emotion recognition model loaded")

            # Load face detection model
            face_cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
            if not os.path.exists(face_cascade_path):
                raise FileNotFoundError(f"Face cascade not found at {face_cascade_path}")
            self.face_cascade = cv2.CascadeClassifier(face_cascade_path)
            logger.info("Face detection model loaded")

        except Exception as e:
            logger.error(f"Model initialization failed: {str(e)}")
            raise

    def _download_video(self, url: str) -> str:
        """Download video from URL to temporary file"""
        try:
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
            urllib.request.urlretrieve(str(url), temp_file.name)
            logger.info(f"Video downloaded to {temp_file.name}")
            return temp_file.name
        except Exception as e:
            logger.error(f"Video download failed: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Video download failed: {str(e)}")

    def _preprocess_face(self, face_img: np.ndarray) -> np.ndarray:
        """Prepare face image for emotion prediction"""
        face_img = cv2.resize(face_img, (48, 48))
        face_img = face_img.astype('float32') / 255.0
        return np.expand_dims(np.expand_dims(face_img, 0), -1)

    def _calculate_results(self, frame_count: int, face_count: int, emotion_counts: Dict[str, int]) -> Dict[str, Any]:
        """Calculate final evaluation metrics"""
        positive_count = sum(emotion_counts[e] for e in POSITIVE_EMOTIONS)
        positive_conf = (positive_count / face_count * 100) if face_count > 0 else 0
        
        return {
            "processed_frames": frame_count,
            "detected_faces": face_count,
            "emotion_counts": emotion_counts,
            "positive_confidence": positive_conf,
            "emotion_percentages": {
                e: (count / face_count * 100) if face_count > 0 else 0
                for e, count in emotion_counts.items()
            }
        }

    def evaluate_video(self, video_path: str, sampling_rate: int = 4, is_url: bool = False) -> Dict[str, Any]:
        """Main video evaluation method"""
        temp_file = None
        try:
            # Handle URL case
            if is_url:
                temp_file = self._download_video(video_path)
                video_path = temp_file

            # Initialize counters
            frame_count = 0
            face_count = 0
            emotion_counts = {e: 0 for e in EMOTIONS.values()}

            # Open video
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise HTTPException(status_code=400, detail="Could not open video file")

            # Calculate processing parameters
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            frame_interval = max(1, int(fps / sampling_rate))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

            logger.info(f"Processing video: {video_path}")
            logger.info(f"FPS: {fps}, Total frames: {total_frames}, Sampling rate: {sampling_rate}")

            # Process frames
            while cap.isOpened():
                ret, frame = cap.read()
                if not ret:
                    break

                if frame_count % frame_interval == 0:
                    # Detect faces
                    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                    faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

                    for (x, y, w, h) in faces:
                        face_count += 1
                        face_roi = gray[y:y+h, x:x+w]
                        
                        # Predict emotion
                        processed_face = self._preprocess_face(face_roi)
                        emotion_probs = self.model.predict(processed_face, verbose=0)[0]
                        emotion_label = EMOTIONS[np.argmax(emotion_probs)]
                        emotion_counts[emotion_label] += 1

                frame_count += 1

                # Log progress
                if frame_count % 100 == 0:
                    logger.info(f"Processed {frame_count}/{total_frames} frames")

            cap.release()
            return self._calculate_results(frame_count, face_count, emotion_counts)

        except Exception as e:
            logger.error(f"Video processing failed: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
        finally:
            if temp_file and os.path.exists(temp_file):
                os.remove(temp_file)

# Initialize evaluator
evaluator = VideoConfidenceEvaluator()

# API Endpoints
@router.get("/")
async def root():
    return {"message": "Video Confidence Evaluation API"}

@router.post("/evaluate", response_model=VideoEvaluationResponse)
async def evaluate_video_endpoint(request: VideoRequest):
    """Evaluate single video endpoint"""
    try:
        results = evaluator.evaluate_video(
            str(request.video_url),
            sampling_rate=request.sampling_rate,
            is_url=True
        )
        return VideoEvaluationResponse(
            video_url=str(request.video_url),
            results=results
        )
    except Exception as e:
        logger.error(f"Evaluation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch-evaluate", response_model=List[BatchVideoEvaluationResponse])
async def batch_evaluate_endpoint(request: BatchVideoRequest):
    """Batch video evaluation endpoint"""
    results = []
    for url in request.video_urls:
        try:
            video_results = evaluator.evaluate_video(
                str(url),
                sampling_rate=request.sampling_rate,
                is_url=True
            )
            results.append(BatchVideoEvaluationResponse(
                video_url=str(url),
                results=video_results
            ))
        except Exception as e:
            results.append(BatchVideoEvaluationResponse(
                video_url=str(url),
                error=str(e)
            ))
    return results