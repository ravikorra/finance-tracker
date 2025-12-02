.PHONY: help backend-run frontend-run dev build clean logs

help:
	@echo "Go Microservice Starter - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev                - Run both backend and frontend"
	@echo "  make backend-run        - Run backend server only"
	@echo "  make frontend-run       - Run frontend dev server only"
	@echo ""
	@echo "Build & Deploy:"
	@echo "  make build              - Build backend binary"
	@echo "  make build-frontend     - Build frontend for production"
	@echo "  make build-all          - Build both backend and frontend"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean              - Clean build artifacts"
	@echo "  make logs               - View backend logs"
	@echo "  make deps               - Download Go dependencies"
	@echo "  make frontend-deps      - Install frontend dependencies"
	@echo ""

# Development
backend-run:
	cd backend && go run ./cmd/server/main.go

frontend-run:
	cd frontend && npm run dev

dev:
	@echo "Starting backend and frontend..."
	@echo "Backend: http://localhost:4100"
	@echo "Frontend: http://localhost:5173"
	@echo ""
	@make backend-run &
	@make frontend-run

# Build
build:
	cd backend && go build -o app ./cmd/server
	@echo "Backend binary created: backend/app"

build-frontend:
	cd frontend && npm run build
	@echo "Frontend build complete: frontend/dist/"

build-all: build build-frontend
	@echo "All builds complete!"

# Dependencies
deps:
	cd backend && go mod download && go mod tidy

frontend-deps:
	cd frontend && npm install

# Maintenance
clean:
	cd backend && rm -f app
	cd frontend && rm -rf dist node_modules
	@echo "Cleaned build artifacts"

logs:
	tail -f backend/log/application.log

# Database
db-reset:
	rm -f backend/data/*.json
	@echo "Data reset complete"

# Docker (optional)
docker-build:
	docker build -t go-finance-tracker .

docker-run:
	docker run -p 4100:4100 go-finance-tracker
