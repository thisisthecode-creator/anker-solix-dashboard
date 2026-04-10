FROM python:3.12-slim

WORKDIR /app

# Install git + tor
RUN apt-get update && apt-get install -y --no-install-recommends git tor && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Clone anker-solix-api
RUN git clone https://github.com/thomluther/anker-solix-api.git /app/anker-solix-api

# Copy app
COPY app/ app/
COPY run.py .
# .env no longer baked in — credentials come from fly secrets as env vars

# Data directory (persistent volume mount point)
RUN mkdir -p /app/data

ENV TZ=Europe/Warsaw

EXPOSE 8420

CMD tor --RunAsDaemon 1 --SocksPort 9050 && sleep 2 && python run.py
