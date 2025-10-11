# Use lightweight Python image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the AI engine code
COPY . .

# Create uploads folder for audio or files
RUN mkdir -p uploads

# Expose Flask port
EXPOSE 8000

# Start the Flask app
CMD ["python", "app.py"]
