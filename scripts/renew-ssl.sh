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

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  SSL Certificate Renewal${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to renew certificate
renew_cert() {
    local domain=$1
    echo -e "${YELLOW}Renewing certificate for $domain...${NC}"
    
    docker run --rm \
        -v "$(pwd)/ssl:/etc/letsencrypt" \
        -v "$(pwd)/certbot/www:/var/www/certbot" \
        certbot/certbot renew \
        --webroot \
        --webroot-path=/var/www/certbot \
        --quiet
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Renewal check completed${NC}"
    else
        echo -e "${RED}✗ Renewal failed${NC}"
        return 1
    fi
}

# Renew all certificates
renew_cert

# Reload nginx to apply new certificates
echo -e "${YELLOW}Reloading nginx...${NC}"
docker exec money-notebook-app nginx -s reload

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}✗ Failed to reload nginx${NC}"
fi

echo ""
echo -e "${GREEN}Renewal process completed!${NC}"
