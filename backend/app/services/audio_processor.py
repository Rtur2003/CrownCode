"""
Audio processing service for data augmentation and manipulation.
"""

import io
import logging
import numpy as np
import librosa
import soundfile as sf
import scipy.signal
from fastapi import UploadFile

from app.schemas import AudioAugmentationOptions

logger = logging.getLogger(__name__)

def process_audio(file_bytes: bytes, options: AudioAugmentationOptions) -> io.BytesIO:
    """
    Process audio file with requested augmentation options.
    Returns processed audio as BytesIO (WAV format).
    """
    try:
        # Load audio from bytes
        # librosa.load expects a file path or file-like object
        y, sr = librosa.load(io.BytesIO(file_bytes), sr=None)
        
        # 1. Trim Silence
        if options.trim_silence:
            y, _ = librosa.effects.trim(y, top_db=20)
            logger.info("Applied trim_silence")

        # 2. Pitch Shift (Randomly between -2 and +2 semitones if enabled)
        if options.pitch_shift:
            n_steps = np.random.uniform(-2, 2)
            y = librosa.effects.pitch_shift(y, sr=sr, n_steps=n_steps)
            logger.info(f"Applied pitch_shift: {n_steps:.2f}")

        # 3. Speed Change (Randomly between 0.9x and 1.1x)
        if options.speed_change:
            rate = np.random.uniform(0.9, 1.1)
            y = librosa.effects.time_stretch(y, rate=rate)
            logger.info(f"Applied speed_change: {rate:.2f}")

        # 4. Add Noise
        if options.add_noise:
            noise_amp = 0.005 * np.max(np.abs(y))
            y = y + noise_amp * np.random.normal(size=len(y))
            logger.info("Applied add_noise")

        # 5. Bass Boost (Simple Low-Shelf Filter)
        if options.bass_boost:
            # Create a simple low-shelf filter emphasizing < 200Hz
            # This is a basic implementation using scipy
            sos = scipy.signal.butter(10, 200, 'lp', fs=sr, output='sos')
            y_boosted = scipy.signal.sosfilt(sos, y)
            # Mix original with boosted low-end
            y = y + (y_boosted * 0.5)
            # Normalize to prevent clipping
            y = librosa.util.normalize(y)
            logger.info("Applied bass_boost")

        # Export to BytesIO as WAV
        out_buffer = io.BytesIO()
        sf.write(out_buffer, y, sr, format='WAV')
        out_buffer.seek(0)
        
        return out_buffer

    except Exception as e:
        logger.error(f"Error processing audio: {str(e)}", exc_info=True)
        raise ValueError(f"Audio processing failed: {str(e)}")
