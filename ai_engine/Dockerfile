FROM python:3.11-slim

WORKDIR /app

# Install only required system libs
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
 && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Upgrade pip, install heavy NLP deps (may take a while!)
  RUN pip install --no-cache-dir -r requirements.txt && \
    rm -rf /root/.cache/pip /tmp/*


COPY . .

RUN mkdir -p uploads

EXPOSE 8000

CMD ["python", "app.py"]
