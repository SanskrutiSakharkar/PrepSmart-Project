FROM python:3.11-slim

WORKDIR /app

# Install system dependencies + pip
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    curl \
    build-essential \
    python3-pip \
 && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN python3 -m pip install --upgrade pip

# Copy requirements
COPY requirements.txt .

# Install PyTorch CPU first (from official wheel URL)
RUN pip install --no-cache-dir torch==2.2.0 -f https://download.pytorch.org/whl/cpu/torch_stable.html

# Install the rest of the dependencies
RUN pip install --no-cache-dir -r requirements.txt && rm -rf /root/.cache/pip /tmp/*

# Copy app code
COPY . .

# Make uploads folder
RUN mkdir -p uploads

EXPOSE 8000

CMD ["python3", "app.py"]
