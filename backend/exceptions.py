"""
Custom Exception Classes

Application-specific exceptions for proper error handling.
"""


class CrownCodeException(Exception):
    """Base exception for all CrownCode errors."""
    
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(CrownCodeException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class AudioProcessingError(CrownCodeException):
    """Raised when audio processing fails."""
    
    def __init__(self, message: str):
        super().__init__(message, status_code=422)


class ModelNotFoundError(CrownCodeException):
    """Raised when AI model cannot be loaded."""
    
    def __init__(self, message: str = "AI model not found or not initialized"):
        super().__init__(message, status_code=503)


class InferenceError(CrownCodeException):
    """Raised when model inference fails."""
    
    def __init__(self, message: str):
        super().__init__(message, status_code=500)
