# Use Python 3.11 slim
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy only requirements first
COPY requirements.txt .

# Upgrade pip and install dependencies
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads folder
RUN mkdir -p uploads

# Expose Flask port
EXPOSE 8000

# Run Flask app
CMD ["python", "app.py"]
