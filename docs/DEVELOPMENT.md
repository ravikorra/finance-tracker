# Development Guide

## Setting Up Development Environment

### Requirements
- Go 1.22+
- Node.js 16+
- Git
- Your favorite code editor (VS Code recommended)

### Initial Setup

```bash
# Clone the repository
git clone <repo-url>
cd finance-tracker

# Backend setup
cd backend
go mod download

# Frontend setup
cd ../frontend
npm install
```

## Running the Application

### Terminal 1 - Backend
```bash
cd backend
go run ./cmd/server/main.go
```
- Server runs on `http://localhost:4100`
- Logs written to `backend/log/application.log`

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
- Frontend runs on `http://localhost:5173`

## Project Dependencies

### Backend (Go)
- `gorilla/mux` v1.8.1 - HTTP router
- `google/uuid` v1.6.0 - UUID generation
- `uber/zap` v1.27.0 - Structured logging

### Frontend (npm)
- `react` - UI framework
- `vite` - Build tool and dev server

## Common Development Tasks

### Adding a New API Endpoint

1. **Create Handler** (`backend/internal/handlers/[feature]/handlers.go`)
```go
package feature

import "net/http"

func GetFeature(w http.ResponseWriter, r *http.Request) {
    // Implementation
}
```

2. **Add Route** (`backend/internal/router/router.go`)
```go
r.HandleFunc("/api/feature", EnableCORS(GetFeature)).Methods("GET")
```

3. **Add API Method** (`frontend/src/services/api.js`)
```javascript
getFeature: () => request('/feature'),
```

4. **Use in Component** (`frontend/src/pages/Feature.jsx`)
```javascript
const data = await api.getFeature();
```

### Adding a New Data Model

1. **Define Model** (`backend/internal/models/`)
2. **Create Handler** with CRUD operations
3. **Add DataStore methods** to persist data
4. **Export from DataStore**

## File Naming Conventions

- **Go files** - lowercase with underscores (snake_case): `user_handler.go`
- **React components** - PascalCase: `UserProfile.jsx`
- **CSS files** - lowercase with hyphens: `user-profile.css`
- **API methods** - camelCase: `getUserProfile()`

## Logging

### Backend Logging
```go
import "finance-tracker/backend/pkg/logger"

logger.Info("Message", zap.String("key", "value"))
logger.Error("Error occurred", zap.Error(err))
logger.Debug("Debug info", zap.Any("data", obj))
```

### Configure Log Level
Edit `backend/config/config.json`:
```json
{
    "log_level": "debug"  // debug, info, warn, error
}
```

## Testing

### Backend Tests (Future)
```bash
cd backend
go test ./...
```

### Frontend Tests (Future)
```bash
cd frontend
npm test
```

## Debugging

### Backend
- Use `logger.Debug()` for detailed logs
- Add print statements and logs before execution
- Check `backend/log/application.log` for errors

### Frontend
- Use browser DevTools console
- Check Network tab for API calls
- Use React DevTools browser extension

## Build & Deployment

### Backend Build
```bash
cd backend
go build -o app ./cmd/server
./app
```

### Frontend Build
```bash
cd frontend
npm run build
```
Creates optimized files in `frontend/dist/`

## Performance Tips

1. Use async/await for API calls
2. Implement loading states in UI
3. Add error handling for all API calls
4. Use JSON for data persistence (upgrade to database later)
5. Implement caching in frontend when needed

## Common Issues

### Port Already in Use
```bash
# Find process using port 4100
lsof -i :4100
# Kill process
kill -9 <PID>
```

### CORS Errors
- Check backend CORS middleware settings
- Verify frontend API base URL
- Ensure OPTIONS requests are handled

### Go Module Issues
```bash
go clean -modcache
go mod tidy
go mod download
```
