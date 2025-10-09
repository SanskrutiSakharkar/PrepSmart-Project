# ========================
# ai_engine/Dockerfile
# ========================

# Use a lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy only requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies (will only rerun if requirements.txt changes)
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Create uploads folder
RUN mkdir -p uploads

# Expose Flask port
EXPOSE 8000

# Start the Flask app
CMD ["python", "app.py"]
