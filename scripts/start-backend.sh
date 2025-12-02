#!/bin/bash

# Backend startup script for development

echo "🚀 Starting Go Finance Tracker Backend..."
echo ""
echo "📋 Environment:"
echo "   Go Version: $(go version)"
echo "   Location: backend/"
echo ""

cd backend

# Check if go.mod exists
if [ ! -f "go.mod" ]; then
    echo "❌ go.mod not found. Running 'go mod init'..."
    go mod init go-microservice-starter
fi

# Download dependencies
echo "📦 Downloading dependencies..."
go mod download

# Run the server
echo ""
echo "✅ Starting server..."
echo "📝 Logs: backend/log/application.log"
echo "🌐 URL: http://localhost:4100"
echo ""

go run ./cmd/server/main.go
