#!/bin/bash

echo "🚀 Starting PDF OCR Backend Server..."
echo "📝 Upload page will be available at http://localhost:3001/"
echo "🔗 Alternative upload page at http://localhost:3001/upload"
echo ""
echo "⚠️  Note: OpenAI API key not configured - using mock data for AI features"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

npx ts-node index.ts 