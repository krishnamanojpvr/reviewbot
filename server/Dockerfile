# Use an official Python runtime as a parent image
FROM python:3.13-slim

# Set the working directory in the container
WORKDIR /app

# Install system dependencies needed by Firefox
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    wget \
    libglib2.0-0 \
    libnss3 \
    libgdk-pixbuf2.0-0 \
    libgtk-3-0 \
    libasound2 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libxshmfence1 \
    libxcb1 \
    libxext6 \
    libxfixes3 \
    libdrm2 \
    && rm -rf /var/lib/apt/lists/*

# Install Playwright and only Firefox browser
RUN pip install playwright && \
    playwright install firefox

# Copy the current directory contents into the container
COPY . .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Run app.py when the container launches
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
