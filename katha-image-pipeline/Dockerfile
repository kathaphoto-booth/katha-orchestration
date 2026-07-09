# Architecture: Cloud Run (chosen over Cloud Functions). Rationale: this service
# needs custom apt packages (potrace, imagemagick, svgo) which Cloud Functions'
# managed runtime cannot install; Cloud Run with min-instances=0 has identical
# zero-traffic cost and lower cold-start for container-native workloads.
# Counsel note: agy (Gemini) was unreachable this session; decision adjudicated
# by the chair per the documented default recommendation.
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    potrace \
    imagemagick \
    nodejs \
    npm \
    && npm install -g svgo \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 main:app
