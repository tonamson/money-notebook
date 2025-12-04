#!/bin/bash

set -e

echo "🚀 Building Money Notebook Production..."

# Build and start
docker compose -f docker-compose.prod.yml build --no-cache

echo "✅ Build completed!"
echo ""
echo "To start production:"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "To view logs:"
echo "  docker compose -f docker-compose.prod.yml logs -f app"
echo ""
echo "To stop:"
echo "  docker compose -f docker-compose.prod.yml down"
