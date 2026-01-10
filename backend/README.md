# CrownCode Backend

Backend services for AI Music Detection and Data Processing

## 🏗️ Structure

```
backend/
├── api/              # API endpoints
│   ├── analyze.py    # Music analysis endpoint
│   ├── health.py     # Health check endpoint
│   └── version.py    # Version information endpoint
├── services/         # Business logic
│   ├── audio.py      # Audio processing
│   └── model.py      # AI model inference
├── validators/       # Input validation
│   └── audio.py      # Audio file validation
├── config.py         # Configuration management
├── exceptions.py     # Custom exceptions
├── logging_config.py # Logging infrastructure
├── main.py           # Application entry point
└── requirements.txt  # Python dependencies
```

## 🔧 Technology Stack

### Core Framework
- **Python**: 3.11+
- **Framework**: FastAPI with async support
- **Validation**: Pydantic v2

### AI/ML
- **PyTorch**: 2.4+ with CUDA 12.9 support (optional)
- **Transformers**: Hugging Face transformers library
- **Model**: facebook/wav2vec2-base + custom classifier (ready for integration)

### Audio Processing
- **librosa**: Audio analysis and feature extraction
- **soundfile**: Audio file I/O
- **audioread**: Additional format support

### Data Processing
- **numpy**: Numerical operations
- **pandas**: Data manipulation

## 📦 Installation

### 1. Prerequisites

- Python 3.11 or higher
- pip 23.0+

### 2. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
# Install base dependencies
pip install -r requirements.txt

# Optional: Install PyTorch with CUDA support for GPU acceleration
pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Run Development Server

```bash
# Using uvicorn directly
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python module
python -m uvicorn backend.main:app --reload
```

The API will be available at:
- **API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🚀 Available Endpoints

### Health & Info
- `GET /api/v1/health` - System health check
- `GET /api/v1/version` - Version and feature information

### Analysis
- `POST /api/v1/analyze` - Analyze audio file for AI detection

## 🧪 Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=backend --cov-report=html

# Run specific test file
pytest tests/test_audio.py
```

## 🎨 Code Quality

### Linting with Ruff

```bash
# Check code
ruff check .

# Fix auto-fixable issues
ruff check --fix .
```

### Formatting with Black

```bash
# Check formatting
black --check .

# Format code
black .
```

## 📝 Development Status

### ✅ Completed
- [x] FastAPI application structure
- [x] Configuration management with environment variables
- [x] Structured logging with rotation
- [x] Audio file validation
- [x] Error handling and custom exceptions
- [x] Health check endpoint
- [x] Version information endpoint
- [x] Analysis endpoint structure
- [x] Audio processing service
- [x] Model service infrastructure

### 🚧 In Progress / Planned
- [ ] Actual wav2vec2 model integration
- [ ] Real audio feature extraction with librosa
- [ ] Model training pipeline
- [ ] Batch processing endpoints
- [ ] Streaming platform integration (YouTube, Spotify, SoundCloud)
- [ ] Data augmentation endpoints
- [ ] Comprehensive test suite
- [ ] API rate limiting
- [ ] Caching layer
- [ ] Database integration

## 🎯 Current Implementation Notes

The backend is currently in **demo mode** with placeholder responses for the AI model:

1. **Model Service** (`services/model.py`): Ready for wav2vec2 integration, currently returns demo predictions
2. **Audio Processing** (`services/audio.py`): File validation works, feature extraction is placeholder
3. **Analysis Endpoint** (`api/analyze.py`): Full workflow implemented, uses demo model

This structure ensures the frontend can develop against a working API while the AI model is being trained.

## 🔐 Security

- Input validation on all endpoints
- File size limits enforced
- Temporary file cleanup
- Type-safe with Pydantic models
- Proper error handling

## 📊 Monitoring

- Structured logging with loguru
- Health check with system metrics
- Request/response logging
- Error tracking

## 🤝 Contributing

1. Follow Python PEP 8 style guide
2. Use type hints
3. Write docstrings for all functions
4. Add tests for new features
5. Run linters before committing

---

**Status**: Active Development
**Target**: Q2 2025 for full AI model integration