#!/bin/bash

# Update system packages
apt-get update
apt-get upgrade -y

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    apt-get install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Create app directory
mkdir -p /root/mamba-frontend
cd /root/mamba-frontend

# Create directory for SSL certificates (if needed)
mkdir -p ssl
mkdir -p certbot/conf
mkdir -p certbot/www

echo "Droplet setup complete. The GitHub Actions workflow will deploy the application."
echo "To manually deploy the application, copy the docker-compose.yml and nginx.conf files to /root/mamba-frontend/ and run:"
echo "cd /root/mamba-frontend && docker-compose up -d" 