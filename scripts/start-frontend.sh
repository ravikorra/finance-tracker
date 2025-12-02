#!/bin/bash

# Frontend startup script for development

echo "🚀 Starting React Frontend..."
echo ""
echo "📋 Environment:"
echo "   Node Version: $(node --version)"
echo "   NPM Version: $(npm --version)"
echo "   Location: frontend/"
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo ""
echo "✅ Starting dev server..."
echo "🌐 URL: http://localhost:5173"
echo ""

npm run dev
