# Mamba React Frontend

Frontend application for Mamba SEO.

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment to DigitalOcean Droplet

### Prerequisites

1. Create a DigitalOcean Droplet using the Docker image
2. Set up the following GitHub secrets:
   - `DROPLET_HOST`: IP address of your DigitalOcean Droplet
   - `DROPLET_USERNAME`: Username for SSH access (usually 'root')
   - `DROPLET_SSH_KEY`: Private SSH key for accessing your Droplet

### Initial Droplet Setup

1. SSH into your Droplet
2. Clone this repository or copy the `setup-droplet.sh` script
3. Run the setup script:
   ```bash
   chmod +x setup-droplet.sh
   ./setup-droplet.sh
   ```

### Automatic Deployment

This repository includes a GitHub Actions workflow that will automatically deploy the application to your DigitalOcean Droplet when you push to the `main` branch.

### Manual Deployment

To manually deploy the application:

1. Build the Docker image:
   ```bash
   docker build -t mamba-frontend:latest .
   ```
2. Copy `docker-compose.yml` and `nginx.conf` to your server
3. Run the application:
   ```bash
   docker-compose up -d
   ```

## SSL Configuration

The configuration includes commented options for setting up SSL with Let's Encrypt:

1. Uncomment the relevant sections in `docker-compose.yml` and `nginx.conf`
2. Replace `your-email@example.com` and `your-domain.com` with your actual email and domain
3. Run the application with `docker-compose up -d`
4. The Certbot container will obtain SSL certificates
5. After the certificates are obtained, uncomment the HTTPS server block in `nginx.conf`
