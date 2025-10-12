# ========================
# ai_engine/Dockerfile
# ========================

# Use a lightweight Python image
FROM python:3.11-slim

# Set working directory inside container
WORKDIR /app

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create uploads folder for audio files
RUN mkdir -p uploads

# Expose Flask port
EXPOSE 8000

# Start the Flask app
CMD ["python", "app.py"]

