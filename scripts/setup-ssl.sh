#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | xargs)
fi

# Check required variables
if [ -z "$FRONTEND_DOMAIN" ] || [ -z "$API_DOMAIN" ] || [ -z "$SSL_EMAIL" ]; then
    echo -e "${RED}Error: Missing required environment variables${NC}"
    echo "Please set FRONTEND_DOMAIN, API_DOMAIN, and SSL_EMAIL in .env file"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SSL Certificate Setup Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Frontend Domain: ${YELLOW}$FRONTEND_DOMAIN${NC}"
echo -e "API Domain: ${YELLOW}$API_DOMAIN${NC}"
echo -e "Email: ${YELLOW}$SSL_EMAIL${NC}"
echo ""

# Create directories
mkdir -p ./ssl/live/$FRONTEND_DOMAIN
mkdir -p ./ssl/live/$API_DOMAIN
mkdir -p ./certbot/www
mkdir -p ./certbot/conf

# Function to obtain certificate
obtain_cert() {
    local domain=$1
    echo -e "${YELLOW}Obtaining certificate for $domain...${NC}"
    
    docker run --rm \
        -v "$(pwd)/ssl:/etc/letsencrypt" \
        -v "$(pwd)/certbot/www:/var/www/certbot" \
        certbot/certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $SSL_EMAIL \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d $domain
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Certificate obtained for $domain${NC}"
    else
        echo -e "${RED}✗ Failed to obtain certificate for $domain${NC}"
        return 1
    fi
}

# Check if we need to start temporary nginx for initial cert
if [ ! -f "./ssl/live/$FRONTEND_DOMAIN/fullchain.pem" ]; then
    echo -e "${YELLOW}Starting temporary nginx for initial certificate...${NC}"
    
    # Create temporary nginx config
    cat > ./docker/nginx/temp.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Start temporary nginx
    docker run -d --name temp-nginx \
        -p 80:80 \
        -v "$(pwd)/docker/nginx/temp.conf:/etc/nginx/http.d/default.conf:ro" \
        -v "$(pwd)/certbot/www:/var/www/certbot" \
        nginx:alpine
    
    sleep 2
    
    # Obtain certificates
    obtain_cert $FRONTEND_DOMAIN
    obtain_cert $API_DOMAIN
    
    # Stop temporary nginx
    docker stop temp-nginx
    docker rm temp-nginx
    rm ./docker/nginx/temp.conf
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Initial SSL Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
else
    echo -e "${YELLOW}Certificates already exist. Use renew-ssl.sh to renew.${NC}"
fi

echo ""
echo -e "${GREEN}Next steps:${NC}"
echo "1. Run: docker compose -f docker-compose.ssl.yml up -d"
echo "2. Setup cron job for auto-renewal (see PRODUCTION.md)"
