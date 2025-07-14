#!/bin/bash

echo "🐳 Starting PDF OCR Backend with Docker..."
echo "📝 Upload page will be available at http://localhost:3001/"
echo "🔗 Alternative upload page at http://localhost:3001/upload"
echo ""
echo "🤖 OpenAI API key is configured in docker-compose.yml"
echo ""
echo "Building and starting backend container..."
echo "=========================================="

# Build and start the backend service
docker-compose up --build backend

echo ""
echo "To stop the container, press Ctrl+C or run: docker-compose down" 