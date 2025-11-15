#!/bin/bash

# Test script to build and run the frontend Docker image with the correct backend URL
# This verifies that VITE_API_URL is properly injected into the build

set -e

BACKEND_URL="https://trendiabackend-154170216171.europe-west1.run.app"
IMAGE_NAME="trendia-frontend-test"
CONTAINER_NAME="trendia-frontend-test-container"

echo "🔨 Building Docker image with VITE_API_URL=$BACKEND_URL"
docker build \
  --build-arg VITE_API_URL=$BACKEND_URL \
  -t $IMAGE_NAME \
  .

echo ""
echo "✅ Build complete!"
echo ""
echo "🔍 Verifying the URL is baked into the bundle..."
echo ""

# Extract the built JS files to check if the URL is correctly embedded
TEMP_CONTAINER=$(docker create $IMAGE_NAME)
docker cp $TEMP_CONTAINER:/usr/share/nginx/html/assets - | tar -xO | grep -o "https://trendiabackend[^\"]*" | head -1 || echo "⚠️  Could not find backend URL in bundle"
docker rm $TEMP_CONTAINER

echo ""
echo "🚀 Starting container on http://localhost:8088"
echo ""

# Stop and remove any existing container
docker rm -f $CONTAINER_NAME 2>/dev/null || true

# Run the container
docker run -d \
  -p 8088:8080 \
  --name $CONTAINER_NAME \
  $IMAGE_NAME

echo ""
echo "✅ Container is running!"
echo "🌐 Open http://localhost:8088 in your browser"
echo ""
echo "📋 To view logs: docker logs -f $CONTAINER_NAME"
echo "🛑 To stop: docker stop $CONTAINER_NAME"
echo ""
