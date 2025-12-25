"""
Music Analysis Endpoint

AI-powered music detection analysis endpoint.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from ..services.audio import get_audio_processor
from ..services.model import get_model_service
from ..validators.audio import AudioFileValidator
from ..exceptions import AudioProcessingError, InferenceError
from ..logging_config import get_logger
from ..utils.file_utils import safe_delete_file

router = APIRouter()
logger = get_logger()


class AnalysisResult(BaseModel):
    """Analysis result response schema."""
    success: bool
    prediction: str
    confidence: float
    model_version: str
    processing_time_ms: int
    metadata: Dict[str, Any]


@router.post("/analyze")
async def analyze_audio(
    file: UploadFile = File(...)
) -> AnalysisResult:
    """
    Analyze audio file to detect AI-generated music.
    
    This endpoint accepts audio files and returns analysis results.
    Currently in demo mode until model training is complete.
    
    Args:
        file: Audio file upload
        
    Returns:
        Analysis results with prediction and confidence
    """
    audio_processor = get_audio_processor()
    model_service = get_model_service()
    
    temp_path = None
    
    try:
        validator = AudioFileValidator(
            filename=file.filename,
            file_size=file.size,
            content_type=file.content_type
        )
        
        logger.info(f"Processing upload: {file.filename}")
        
        file_content = await file.read()
        temp_path = audio_processor.save_upload(file_content, file.filename)
        
        audio_processor.validate_audio(temp_path)
        
        features = audio_processor.extract_features(temp_path)
        
        prediction = model_service.predict(str(temp_path))
        
        return AnalysisResult(
            success=True,
            prediction=prediction["prediction"],
            confidence=prediction["confidence"],
            model_version=prediction["model_version"],
            processing_time_ms=prediction["processing_time_ms"],
            metadata={
                "filename": file.filename,
                "features": features,
                "note": prediction.get("note", "")
            }
        )
        
    except AudioProcessingError as e:
        logger.error(f"Audio processing failed: {str(e)}")
        raise HTTPException(status_code=422, detail=str(e))
    
    except InferenceError as e:
        logger.error(f"Model inference failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")
    
    finally:
        # Clean up temporary file
        if temp_path:
            if not safe_delete_file(temp_path):
                logger.warning(f"Failed to cleanup temp file: {temp_path}")
