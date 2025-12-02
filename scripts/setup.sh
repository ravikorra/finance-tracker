#!/bin/bash

# Complete setup script

echo "🚀 Setting up Go Finance Tracker..."
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend
go mod download
go mod tidy
echo "✅ Backend ready"
echo ""

# Frontend setup
cd ../frontend
echo "📦 Setting up frontend..."
npm install
echo "✅ Frontend ready"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "  Terminal 1: ./scripts/start-backend.sh"
echo "  Terminal 2: ./scripts/start-frontend.sh"
echo ""
echo "Or use: make dev"
