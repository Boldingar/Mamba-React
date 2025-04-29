#!/bin/bash

# Script to completely refresh your deployment with the latest code
# Run this when you need to force a rebuild and redeployment

echo "Starting complete deployment refresh..."

# Navigate to your project directory
cd /root/Mamba-React

# Pull the latest changes
echo "Pulling latest changes from GitHub..."
git pull origin main

# Clean up Docker resources
echo "Stopping and removing containers..."
docker-compose down --remove-orphans -v

# Remove the Docker image to force a rebuild
echo "Removing Docker image to force rebuild..."
docker rmi mamba-frontend:latest || true

# Rebuild the Docker image
echo "Rebuilding Docker image..."
docker build -t mamba-frontend:latest .

# Start the services 
echo "Starting services..."
export DEPLOY_ID=$(date +%Y%m%d%H%M%S)
docker-compose up -d

echo "Deployment refresh completed at $(date)"
echo "Your application is now running with the latest code."
echo "If you still see the old version, try clearing your browser cache." 