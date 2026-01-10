# ============================================
# CrownCode Backend - Hugging Face Spaces
# ============================================
# SDK: Docker | Hardware: CPU Basic (Free)
# ============================================

FROM python:3.10-slim

# Çalışma dizini
WORKDIR /app

# Ortam değişkenleri
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    TRANSFORMERS_CACHE=/app/.cache/huggingface \
    HF_HOME=/app/.cache/huggingface \
    TORCH_HOME=/app/.cache/torch

# Sistem bağımlılıkları + FFmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libsndfile1 \
    git \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Cache dizinleri
RUN mkdir -p /app/.cache/huggingface /app/.cache/torch \
    && chmod -R 777 /app/.cache

# Requirements (önce kopyala - Docker cache için)
COPY requirements.txt .

# PyTorch CPU versiyonu + diğer paketler
RUN pip install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Uygulama kodu
COPY app ./app

# Hugging Face Spaces için non-root kullanıcı (güvenlik)
RUN useradd -m -u 1000 user \
    && chown -R user:user /app
USER user

ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    CROWNCODE_CORS_ORIGINS="*"

# Hugging Face Spaces varsayılan port: 7860
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/api/health || exit 1

# Başlat
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
