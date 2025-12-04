#!/bin/sh

# Replace environment variables in nginx config
envsubst '${FRONTEND_DOMAIN} ${API_DOMAIN}' < /etc/nginx/templates/ssl.conf.template > /etc/nginx/http.d/default.conf

echo "Starting Money Notebook Production..."

# Start PM2 with API
cd /app/api
echo "Starting API with PM2..."
pm2-runtime start ecosystem.config.json &

# Wait for API to be ready
sleep 3

# Start Nginx
echo "Starting Nginx..."
nginx -g "daemon off;"
