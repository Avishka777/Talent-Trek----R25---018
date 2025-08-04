import os
import re
import subprocess
import logging
import nltk
from typing import List, Tuple, Dict, Optional
import speech_recognition as sr
from sentence_transformers import SentenceTransformer, util
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import requests

# Configure logging
logger = logging.getLogger(__name__)

# Download NLTK data
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('omw-1.4', quiet=True)

def post_process_text(text: str) -> str:
    """Fix common speech recognition errors"""
    if not text:
        return ""
    
    corrections = {
        "post tag": "full stack",
        "post that": "full stack",
        "post tack": "full stack",
        "post track": "full stack",
        "assault gains": "a software engineer",
        "probe as lonely": "problem solving",
    }
    
    for wrong, right in corrections.items():
        text = text.replace(wrong, right)
    
    return text

def clean_text(text: str) -> str:
    """Clean and normalize text for better comparison"""
    if not text or not isinstance(text, str):
        return ""
    
    text = post_process_text(text)
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    
    try:
        tokens = word_tokenize(text)
    except:
        tokens = text.split()
    
    try:
        stop_words = set(stopwords.words('english'))
        tokens = [word for word in tokens if word not in stop_words]
    except:
        pass
    
    try:
        lemmatizer = WordNetLemmatizer()
        tokens = [lemmatizer.lemmatize(word) for word in tokens]
    except:
        pass
    
    return ' '.join(tokens)

def keyword_match_score(candidate: str, ideal: str) -> float:
    clean_ideal = clean_text(ideal)
    clean_candidate = clean_text(candidate)
    ideal_words = set(clean_ideal.split())
    candidate_words = set(clean_candidate.split())
    matches = ideal_words.intersection(candidate_words)
    return len(matches) / len(ideal_words) if ideal_words else 0

def evaluate_answer(candidate_answer: str, ideal_answer: str) -> Tuple[float, Dict]:
    if not candidate_answer:
        return 0.0, {
            "semantic_similarity": 0,
            "keyword_match": 0,
            "length_ratio": 0
        }
    
    model = SentenceTransformer('all-mpnet-base-v2')
    clean_candidate = clean_text(candidate_answer)
    clean_ideal = clean_text(ideal_answer)
    
    try:
        candidate_embedding = model.encode(clean_candidate, convert_to_tensor=True)
        ideal_embedding = model.encode(clean_ideal, convert_to_tensor=True)
        similarity_score = util.pytorch_cos_sim(candidate_embedding, ideal_embedding).item()
    except Exception as e:
        logger.error(f"Error calculating semantic similarity: {e}")
        similarity_score = 0
    
    keyword_score = keyword_match_score(candidate_answer, ideal_answer)
    candidate_words = len(clean_candidate.split())
    ideal_words = len(clean_ideal.split())
    length_ratio = min(1.0, candidate_words / ideal_words) if ideal_words > 0 else 0
    
    final_score = (
        0.6 * similarity_score + 
        0.3 * keyword_score + 
        0.1 * length_ratio
    )
    
    correctness_percentage = max(0, min(100, round(final_score * 100, 2)))
    
    detailed_metrics = {
        "semantic_similarity": round(similarity_score * 100, 2),
        "keyword_match": round(keyword_score * 100, 2),
        "length_ratio": round(length_ratio * 100, 2)
    }
    
    return correctness_percentage, detailed_metrics

def extract_audio_from_video(video_path: str, audio_path: str) -> bool:
    try:
        result = subprocess.run([
            'ffmpeg',
            '-i', video_path,
            '-vn',
            '-acodec', 'pcm_s16le',
            '-ar', '16000',
            '-ac', '1',
            '-q:a', '0',
            '-y',
            audio_path
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            logger.error(f"FFmpeg error: {result.stderr}")
            return False
        return True
    except Exception as e:
        logger.error(f"Error extracting audio: {e}")
        return False

def try_multiple_recognizers(audio_path: str) -> List[Tuple[str, str, float]]:
    recognizer = sr.Recognizer()
    results = []
    
    try:
        with sr.AudioFile(audio_path) as source:
            recognizer.adjust_for_ambient_noise(source, duration=1)
            audio = recognizer.record(source)
            
            try:
                text = recognizer.recognize_google(audio, show_all=True)
                if text and 'alternative' in text:
                    for alt in text['alternative']:
                        if 'transcript' in alt:
                            confidence = alt.get('confidence', 0.7)
                            results.append(("google", alt['transcript'], confidence))
            except sr.UnknownValueError:
                logger.info("Google Speech Recognition could not understand audio")
            except sr.RequestError as e:
                logger.error(f"Google Speech API error: {e}")
            
            if not results:
                try:
                    text = recognizer.recognize_sphinx(audio)
                    if text:
                        results.append(("sphinx", text, 0.5))
                except Exception as e:
                    logger.error(f"Sphinx recognition error: {e}")
                    
    except Exception as e:
        logger.error(f"Error in speech recognition: {e}")
        
    return results

def select_best_transcription(transcriptions: List[Tuple[str, str, float]]) -> Tuple[str, str]:
    if not transcriptions:
        return "", ""
    
    sorted_results = sorted(transcriptions, key=lambda x: (-x[2], -len(x[1])))
    return sorted_results[0][0], sorted_results[0][1]

def download_video(video_link: str, save_path: str) -> bool:
    try:
        response = requests.get(video_link, timeout=10)
        response.raise_for_status()
        with open(save_path, "wb") as f:
            f.write(response.content)
        return True
    except Exception as e:
        logger.error(f"Video download failed: {e}")
        return False

def cleanup_files(*file_paths: str) -> None:
    for file_path in file_paths:
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            logger.error(f"Error cleaning up file {file_path}: {e}")