"""
Routes for data processing and manipulation (Audio/Image).
"""

from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import Json
import logging

from app.schemas import AudioAugmentationOptions
from app.services.audio_processor import process_audio

router = APIRouter(prefix="/api/process", tags=["Data Processing"])
logger = logging.getLogger(__name__)

@router.post("/audio")
async def process_audio_endpoint(
    file: UploadFile = File(...),
    options: Json[AudioAugmentationOptions] = Form(...)
):
    """
    Process an audio file with the given augmentation options.
    Returns the processed WAV file.
    """
    logger.info(f"Received audio processing request for file: {file.filename}")
    
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="Invalid file type. Must be audio.")

    try:
        # Read file content
        content = await file.read()
        
        # Process audio
        processed_audio = process_audio(content, options)
        
        # Return as downloadable file
        filename = f"processed_{file.filename}.wav"
        return StreamingResponse(
            processed_audio,
            media_type="audio/wav",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in audio processing: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error during audio processing")
