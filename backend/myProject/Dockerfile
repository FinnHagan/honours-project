# Base Image
FROM python:3.12.0-slim

# Set working directory
WORKDIR backend/myProject

# Environment variables (For production, we'll get these from Cloud Run)
ENV PYTHONUNBUFFERED=1

# Copy requirements
COPY requirements.txt ./

# Install dependencies 
RUN pip install -r requirements.txt

# Copy your Django project code
COPY . ./

# Expose the port Django usually runs on
EXPOSE 8000

# Command to start the Django server (suitable for development)
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "myProject.wsgi:application"] 