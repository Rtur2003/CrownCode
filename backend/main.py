"""
CrownCode Backend - Main Application Entry Point

FastAPI application for AI music detection and data manipulation.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="CrownCode API",
    description="AI-Powered Music Detection & Data Analysis Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "name": "CrownCode API",
        "version": "1.0.0",
        "status": "operational"
    }
