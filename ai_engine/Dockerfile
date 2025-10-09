# Use Python slim image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Copy all files in ai_engine folder
COPY . .

# Install Python dependencies directly
RUN pip install --no-cache-dir flask flask-cors librosa numpy scikit-learn sentence-transformers werkzeug

# Create uploads folder
RUN mkdir -p uploads

# Expose port 8000
EXPOSE 8000

# Start the Flask app
CMD ["python", "app.py"]
