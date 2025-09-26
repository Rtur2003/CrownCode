# Teknik Spesifikasyonlar

## 🏗️ Sistem Mimarisi

### Genel Mimari Yaklaşımı
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐ │
│  │   Next.js   │ │  React.js   │ │      Tailwind CSS       │ │
│  │   Routing   │ │ Components  │ │    Design System        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                             │
                     ┌───────┼───────┐
                     │       │       │
┌─────────────────────▼─┐ ┌───▼───┐ ┌─▼─────────────────────────┐
│     API GATEWAY       │ │  CDN  │ │    STATIC HOSTING         │
│   (Vercel Edge)       │ │ Edge  │ │      (Netlify)            │
└─────────────────────┬─┘ └───────┘ └───────────────────────────┘
                      │
┌─────────────────────▼─────────────────────────────────────────┐
│                   BACKEND LAYER                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │  Express.js │ │ Serverless  │ │     Microservices       │   │
│  │     API     │ │ Functions   │ │    Architecture         │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                             │
┌─────────────────────────────▼─────────────────────────────────┐
│                    DATA LAYER                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │ PostgreSQL  │ │    Redis    │ │     Blob Storage        │   │
│  │  Database   │ │   Caching   │ │    File Storage         │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📱 Frontend Spesifikasyonları

### Framework Stack
```typescript
// Next.js 14+ Configuration
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponents: true,
  },
  images: {
    domains: ['hasanarthuraltuntas.xyz', 'vercel.app'],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin',
        },
      ],
    },
  ],
}

module.exports = nextConfig
```

### State Management
```typescript
// Zustand Store Configuration
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  user: User | null
  theme: 'dark' | 'light'
  isLoading: boolean
  error: string | null
  // Data manipulation state
  uploads: UploadState[]
  processedFiles: ProcessedFile[]
  // AI music detector state
  audioAnalysis: AudioAnalysis[]
  detectionHistory: DetectionResult[]
}

interface AppActions {
  setUser: (user: User | null) => void
  setTheme: (theme: 'dark' | 'light') => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  // Data manipulation actions
  addUpload: (upload: UploadState) => void
  updateUploadProgress: (id: string, progress: number) => void
  addProcessedFile: (file: ProcessedFile) => void
  // AI music detector actions
  addAudioAnalysis: (analysis: AudioAnalysis) => void
  updateDetectionResult: (result: DetectionResult) => void
}

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        theme: 'dark',
        isLoading: false,
        error: null,
        uploads: [],
        processedFiles: [],
        audioAnalysis: [],
        detectionHistory: [],

        // Actions
        setUser: (user) => set({ user }),
        setTheme: (theme) => set({ theme }),
        setLoading: (isLoading) => set({ isLoading }),
        setError: (error) => set({ error }),
        addUpload: (upload) => set((state) => ({
          uploads: [...state.uploads, upload]
        })),
        updateUploadProgress: (id, progress) => set((state) => ({
          uploads: state.uploads.map(upload =>
            upload.id === id ? { ...upload, progress } : upload
          )
        })),
        // ... other actions
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ theme: state.theme, user: state.user }),
      }
    )
  )
)
```

### Component Architecture
```typescript
// Component Structure
src/
├── components/
│   ├── ui/                    # Base UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   └── index.ts
│   ├── layout/                # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Layout.tsx
│   ├── data-manipulation/     # Data module components
│   │   ├── FileUpload.tsx
│   │   ├── DataViewer.tsx
│   │   ├── ProcessingQueue.tsx
│   │   └── ResultsDisplay.tsx
│   ├── ai-music-detector/     # AI module components
│   │   ├── AudioUpload.tsx
│   │   ├── Waveform.tsx
│   │   ├── DetectionResults.tsx
│   │   └── AnalysisChart.tsx
│   └── common/                # Shared components
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       ├── NotificationToast.tsx
│       └── ProgressBar.tsx
```

### TypeScript Interfaces
```typescript
// types/index.ts
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'user' | 'premium' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface UploadState {
  id: string
  fileName: string
  fileSize: number
  fileType: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
  uploadedAt: Date
}

export interface ProcessedFile {
  id: string
  originalFileId: string
  fileName: string
  processedSize: number
  processingType: 'duplicate' | 'augment' | 'transform'
  downloadUrl: string
  expiresAt: Date
  createdAt: Date
}

export interface AudioAnalysis {
  id: string
  fileName: string
  duration: number
  sampleRate: number
  channels: number
  format: string
  waveformData: number[]
  spectogramData: number[][]
  features: {
    mfcc: number[][]
    tempo: number
    key: string
    energy: number
    valence: number
  }
  uploadedAt: Date
}

export interface DetectionResult {
  id: string
  audioAnalysisId: string
  isAiGenerated: boolean
  confidence: number
  modelVersion: string
  processingTime: number
  details: {
    artificialIndicators: string[]
    humanIndicators: string[]
    uncertaintyAreas: string[]
  }
  createdAt: Date
}
```

## 🔧 Backend Spesifikasyonları

### API Endpoint Structure
```typescript
// API Routes Structure
api/
├── auth/
│   ├── login.ts              # POST /api/auth/login
│   ├── register.ts           # POST /api/auth/register
│   ├── logout.ts             # POST /api/auth/logout
│   ├── refresh.ts            # POST /api/auth/refresh
│   └── profile.ts            # GET/PUT /api/auth/profile
├── data-manipulation/
│   ├── upload.ts             # POST /api/data/upload
│   ├── process.ts            # POST /api/data/process
│   ├── status/[id].ts        # GET /api/data/status/[id]
│   ├── download/[id].ts      # GET /api/data/download/[id]
│   └── history.ts            # GET /api/data/history
├── ai-music-detector/
│   ├── upload.ts             # POST /api/music/upload
│   ├── analyze.ts            # POST /api/music/analyze
│   ├── results/[id].ts       # GET /api/music/results/[id]
│   └── history.ts            # GET /api/music/history
├── admin/
│   ├── users.ts              # GET/PUT/DELETE /api/admin/users
│   ├── analytics.ts          # GET /api/admin/analytics
│   └── system.ts             # GET /api/admin/system
└── health.ts                 # GET /api/health
```

### Database Schema
```sql
-- PostgreSQL Database Schema

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'premium', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data uploads table
CREATE TABLE data_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'error')),
    error_message TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processed files table
CREATE TABLE processed_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upload_id UUID REFERENCES data_uploads(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    processing_type VARCHAR(50) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    download_url VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audio analyses table
CREATE TABLE audio_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    duration REAL NOT NULL,
    sample_rate INTEGER NOT NULL,
    channels INTEGER NOT NULL,
    format VARCHAR(20) NOT NULL,
    storage_path VARCHAR(500) NOT NULL,
    waveform_data JSONB,
    features JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detection results table
CREATE TABLE detection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audio_analysis_id UUID REFERENCES audio_analyses(id) ON DELETE CASCADE,
    is_ai_generated BOOLEAN NOT NULL,
    confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    model_version VARCHAR(50) NOT NULL,
    processing_time_ms INTEGER NOT NULL,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processing jobs table
CREATE TABLE processing_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User sessions table
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API rate limiting table
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier VARCHAR(255) NOT NULL, -- user_id or IP address
    endpoint VARCHAR(255) NOT NULL,
    requests_count INTEGER DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(identifier, endpoint)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_data_uploads_user_id ON data_uploads(user_id);
CREATE INDEX idx_data_uploads_status ON data_uploads(status);
CREATE INDEX idx_processed_files_upload_id ON processed_files(upload_id);
CREATE INDEX idx_audio_analyses_user_id ON audio_analyses(user_id);
CREATE INDEX idx_detection_results_audio_id ON detection_results(audio_analysis_id);
CREATE INDEX idx_processing_jobs_user_id ON processing_jobs(user_id);
CREATE INDEX idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_rate_limits_identifier ON rate_limits(identifier);
```

### API Middleware Stack
```typescript
// middleware/index.ts
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { authenticate } from './auth'
import { validateRequest } from './validation'
import { errorHandler } from './errorHandler'
import { requestLogger } from './logger'

export const configureMiddleware = (app: express.Application) => {
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "vercel.app"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "wss:", "https:"],
      },
    },
  }))

  // CORS configuration
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'https://hasanarthuraltuntas.xyz',
      'https://www.hasanarthuraltuntas.xyz'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }))

  // Rate limiting
  app.use('/api/', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  }))

  // Stricter rate limiting for upload endpoints
  app.use('/api/data/upload', rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // limit to 10 uploads per minute
  }))

  app.use('/api/music/upload', rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit to 5 audio uploads per minute
  }))

  // Request logging
  app.use(requestLogger)

  // Parse JSON bodies
  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: true, limit: '50mb' }))

  // Authentication middleware (applied selectively)
  app.use('/api/data', authenticate)
  app.use('/api/music', authenticate)
  app.use('/api/admin', authenticate, requireRole('admin'))

  // Error handling (must be last)
  app.use(errorHandler)
}
```

## 🤖 AI/ML Spesifikasyonları

### Model Architecture
```python
# AI Music Detection Model
import tensorflow as tf
from tensorflow.keras import layers, Model

def create_music_detection_model(input_shape=(128, 1293, 1)):
    """
    CNN-LSTM hybrid model for AI music detection
    Input: MFCC spectrograms (128 mel bins, variable time steps)
    Output: Binary classification (AI vs Human) with confidence
    """

    # Input layer
    inputs = layers.Input(shape=input_shape, name='spectrogram_input')

    # Convolutional layers for feature extraction
    x = layers.Conv2D(32, (3, 3), activation='relu', padding='same')(inputs)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Conv2D(64, (3, 3), activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.25)(x)

    x = layers.Conv2D(128, (3, 3), activation='relu', padding='same')(x)
    x = layers.BatchNormalization()(x)
    x = layers.MaxPooling2D((2, 2))(x)
    x = layers.Dropout(0.25)(x)

    # Reshape for LSTM layers
    x = layers.Reshape((-1, 128))(x)

    # LSTM layers for temporal modeling
    x = layers.LSTM(64, return_sequences=True, dropout=0.3)(x)
    x = layers.LSTM(32, dropout=0.3)(x)

    # Dense layers for classification
    x = layers.Dense(64, activation='relu')(x)
    x = layers.Dropout(0.5)(x)
    x = layers.Dense(32, activation='relu')(x)
    x = layers.Dropout(0.3)(x)

    # Output layer
    outputs = layers.Dense(1, activation='sigmoid', name='ai_probability')(x)

    model = Model(inputs=inputs, outputs=outputs)

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='binary_crossentropy',
        metrics=['accuracy', 'precision', 'recall']
    )

    return model

# Model training configuration
TRAINING_CONFIG = {
    'batch_size': 32,
    'epochs': 100,
    'validation_split': 0.2,
    'early_stopping_patience': 10,
    'reduce_lr_patience': 5,
    'data_augmentation': {
        'time_stretch': [0.9, 1.1],
        'pitch_shift': [-2, 2],
        'noise_injection': 0.005,
        'masking_freq': 0.1,
        'masking_time': 0.1
    }
}
```

### Feature Extraction Pipeline
```python
# Audio feature extraction
import librosa
import numpy as np
from typing import Dict, Tuple

class AudioFeatureExtractor:
    def __init__(self,
                 sample_rate: int = 22050,
                 n_mfcc: int = 13,
                 n_fft: int = 2048,
                 hop_length: int = 512):
        self.sample_rate = sample_rate
        self.n_mfcc = n_mfcc
        self.n_fft = n_fft
        self.hop_length = hop_length

    def extract_features(self, audio_path: str) -> Dict:
        """Extract comprehensive audio features for AI detection"""

        # Load audio
        y, sr = librosa.load(audio_path, sr=self.sample_rate)

        # Basic features
        features = {
            'duration': len(y) / sr,
            'sample_rate': sr,
            'rms_energy': librosa.feature.rms(y=y)[0],
            'zero_crossing_rate': librosa.feature.zero_crossing_rate(y)[0]
        }

        # Spectral features
        features.update({
            'spectral_centroid': librosa.feature.spectral_centroid(y=y, sr=sr)[0],
            'spectral_bandwidth': librosa.feature.spectral_bandwidth(y=y, sr=sr)[0],
            'spectral_rolloff': librosa.feature.spectral_rolloff(y=y, sr=sr)[0],
            'spectral_contrast': librosa.feature.spectral_contrast(y=y, sr=sr),
        })

        # MFCC features
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=self.n_mfcc)
        features['mfcc'] = mfcc
        features['mfcc_delta'] = librosa.feature.delta(mfcc)
        features['mfcc_delta2'] = librosa.feature.delta(mfcc, order=2)

        # Chroma and tempo
        features['chroma'] = librosa.feature.chroma_stft(y=y, sr=sr)
        features['tempo'], _ = librosa.beat.beat_track(y=y, sr=sr)

        # Mel spectrogram for deep learning
        features['mel_spectrogram'] = librosa.feature.melspectrogram(
            y=y, sr=sr, n_fft=self.n_fft, hop_length=self.hop_length
        )

        return features

    def prepare_for_model(self, features: Dict) -> np.ndarray:
        """Prepare features for model input"""
        mel_spec = features['mel_spectrogram']
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)

        # Normalize
        mel_spec_norm = (mel_spec_db - mel_spec_db.mean()) / mel_spec_db.std()

        # Reshape for CNN input
        return mel_spec_norm.reshape(mel_spec_norm.shape[0], mel_spec_norm.shape[1], 1)
```

### TensorFlow.js Integration
```typescript
// AI model integration in frontend
import * as tf from '@tensorflow/tfjs'

export class MusicDetectionService {
  private model: tf.LayersModel | null = null
  private isModelLoaded = false

  async loadModel(): Promise<void> {
    if (this.isModelLoaded) return

    try {
      // Load model from CDN or Vercel static files
      this.model = await tf.loadLayersModel('/models/music-detector/model.json')
      this.isModelLoaded = true
      console.log('AI Music Detection model loaded successfully')
    } catch (error) {
      console.error('Failed to load AI model:', error)
      throw new Error('Model loading failed')
    }
  }

  async analyzeAudio(audioBuffer: ArrayBuffer): Promise<DetectionResult> {
    if (!this.model) {
      throw new Error('Model not loaded. Call loadModel() first.')
    }

    const startTime = performance.now()

    try {
      // Convert audio to features (this would typically be done on backend)
      const features = await this.extractFeatures(audioBuffer)

      // Prepare tensor input
      const inputTensor = tf.tensor4d([features], [1, features.length, features[0].length, 1])

      // Run inference
      const prediction = this.model.predict(inputTensor) as tf.Tensor
      const confidence = await prediction.data()

      // Cleanup tensors
      inputTensor.dispose()
      prediction.dispose()

      const processingTime = performance.now() - startTime

      return {
        isAiGenerated: confidence[0] > 0.5,
        confidence: confidence[0],
        processingTime,
        modelVersion: 'v1.0.0',
        details: this.generateDetails(confidence[0])
      }
    } catch (error) {
      console.error('Audio analysis failed:', error)
      throw new Error('Analysis failed')
    }
  }

  private async extractFeatures(audioBuffer: ArrayBuffer): Promise<number[][]> {
    // This is a simplified version - in practice, you'd use Web Audio API
    // or send to backend for proper feature extraction
    const audioContext = new AudioContext()
    const audioBufferData = await audioContext.decodeAudioData(audioBuffer)

    // Extract MFCC-like features using Web Audio API
    // Implementation would involve FFT, mel-scale conversion, etc.
    // For now, returning placeholder
    return Array(128).fill(0).map(() => Array(100).fill(0).map(() => Math.random()))
  }

  private generateDetails(confidence: number): {
    artificialIndicators: string[]
    humanIndicators: string[]
    uncertaintyAreas: string[]
  } {
    const details = {
      artificialIndicators: [],
      humanIndicators: [],
      uncertaintyAreas: []
    }

    if (confidence > 0.8) {
      details.artificialIndicators.push('High spectral regularity detected')
      details.artificialIndicators.push('Unnatural temporal patterns')
    } else if (confidence > 0.6) {
      details.artificialIndicators.push('Some artificial characteristics present')
      details.uncertaintyAreas.push('Mixed human-AI patterns detected')
    } else if (confidence < 0.2) {
      details.humanIndicators.push('Natural breathing patterns detected')
      details.humanIndicators.push('Human-like imperfections present')
    } else {
      details.uncertaintyAreas.push('Ambiguous spectral characteristics')
      details.humanIndicators.push('Some natural elements detected')
    }

    return details
  }
}
```

## 🔒 Güvenlik Spesifikasyonları

### Authentication & Authorization
```typescript
// JWT Token implementation
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

interface TokenPayload {
  userId: string
  email: string
  role: string
  exp: number
  iat: number
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET!
  private readonly REFRESH_SECRET = process.env.REFRESH_SECRET!
  private readonly ACCESS_TOKEN_EXPIRY = '15m'
  private readonly REFRESH_TOKEN_EXPIRY = '7d'

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword)
  }

  generateAccessToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): string {
    return jwt.sign(payload, this.JWT_SECRET, {
      expiresIn: this.ACCESS_TOKEN_EXPIRY,
    })
  }

  generateRefreshToken(payload: Omit<TokenPayload, 'exp' | 'iat'>): string {
    return jwt.sign(payload, this.REFRESH_SECRET, {
      expiresIn: this.REFRESH_TOKEN_EXPIRY,
    })
  }

  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, this.JWT_SECRET) as TokenPayload
  }

  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, this.REFRESH_SECRET) as TokenPayload
  }
}

// Middleware for authentication
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const token = authHeader.substring(7)
    const authService = new AuthService()
    const payload = authService.verifyAccessToken(token)

    // Attach user info to request
    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role
    }

    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

### Input Validation
```typescript
// Validation schemas using Joi
import Joi from 'joi'

export const validationSchemas = {
  userRegistration: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      })
  }),

  fileUpload: Joi.object({
    fileName: Joi.string().max(255).required(),
    fileSize: Joi.number().max(100 * 1024 * 1024).required(), // 100MB max
    fileType: Joi.string().valid(
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/xml'
    ).required()
  }),

  audioUpload: Joi.object({
    fileName: Joi.string().max(255).required(),
    fileSize: Joi.number().max(50 * 1024 * 1024).required(), // 50MB max
    fileType: Joi.string().valid(
      'audio/mpeg',
      'audio/wav',
      'audio/flac',
      'audio/ogg'
    ).required(),
    duration: Joi.number().max(600).required() // 10 minutes max
  }),

  dataProcessing: Joi.object({
    uploadId: Joi.string().uuid().required(),
    processingType: Joi.string().valid('duplicate', 'augment', 'transform').required(),
    options: Joi.object({
      multiplier: Joi.number().min(2).max(10),
      columns: Joi.array().items(Joi.string()),
      transformations: Joi.array().items(Joi.string())
    })
  })
}

// Validation middleware
export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body)

    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      })
    }

    req.body = value
    next()
  }
}
```

## 📊 Monitoring & Analytics

### Performance Monitoring
```typescript
// Performance monitoring setup
import { NextRequest, NextResponse } from 'next/server'

export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics: Map<string, number[]> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  recordMetric(endpoint: string, responseTime: number, statusCode: number) {
    const key = `${endpoint}_${statusCode}`
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    this.metrics.get(key)!.push(responseTime)

    // Keep only last 1000 measurements
    if (this.metrics.get(key)!.length > 1000) {
      this.metrics.get(key)!.shift()
    }
  }

  getAverageResponseTime(endpoint: string): number {
    const times = this.metrics.get(endpoint) || []
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }

  getMetrics() {
    const summary: Record<string, any> = {}

    for (const [key, values] of this.metrics.entries()) {
      summary[key] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99)
      }
    }

    return summary
  }

  private percentile(values: number[], p: number): number {
    const sorted = [...values].sort((a, b) => a - b)
    const index = Math.ceil((p / 100) * sorted.length) - 1
    return sorted[index] || 0
  }
}

// Middleware for performance tracking
export const performanceMiddleware = (req: NextRequest) => {
  const start = Date.now()

  return async (res: NextResponse) => {
    const duration = Date.now() - start
    const monitor = PerformanceMonitor.getInstance()

    monitor.recordMetric(
      req.nextUrl.pathname,
      duration,
      res.status
    )

    // Add performance headers
    res.headers.set('X-Response-Time', `${duration}ms`)
    res.headers.set('X-Timestamp', new Date().toISOString())

    return res
  }
}
```

Bu teknik spesifikasyon, projenin her katmanında kullanılacak teknolojileri, mimarileri ve implementasyon detaylarını kapsamlı olarak tanımlar.