# Python slim base image
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies and pip
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    curl \
    python3-pip \
 && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN python3 -m pip install --upgrade pip

# Copy requirements
COPY requirements.txt .

# Install PyTorch CPU first
RUN pip install --no-cache-dir torch==2.2.0 -f https://download.pytorch.org/whl/cpu/torch_stable.html

# Install remaining Python dependencies
RUN pip install --no-cache-dir -r requirements.txt && rm -rf /root/.cache/pip /tmp/*

# Copy the app code
COPY . .

# Create uploads folder
RUN mkdir -p uploads

EXPOSE 8000

CMD ["python3", "app.py"]
