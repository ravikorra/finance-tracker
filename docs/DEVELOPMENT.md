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
go run ./cmd/server
```
- Server runs on `http://localhost:5000` (configurable via PORT env var)
- Logs show structured output with timestamps
- Data stored in `./data` (configurable via DATA_DIR env var)

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
- Frontend runs on `http://localhost:5173`
- Hot reload enabled for development

## Project Dependencies

### Backend (Go)
- `github.com/google/uuid` v1.6.0 - UUID generation
- Standard library only (net/http, encoding/json, sync, etc.)
- No external frameworks (custom router with net/http)

### Frontend (npm)
- `react` v19.2.0 - UI framework
- `vite` v7.2.4 - Build tool and dev server
- `eslint` - Code quality checking

## Common Development Tasks

### Adding a New API Endpoint

1. **Create Handler** (`backend/internal/handlers/handlers.go`)
```go
func (h *Handler) GetFeature(w http.ResponseWriter, r *http.Request) {
    // Get data from storage
    // Return response
}

// Add routing helper
func (h *Handler) FeatureHandler(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case "GET":
        h.GetFeature(w, r)
    default:
        middleware.ErrorResponse(w, "Method not allowed", http.StatusMethodNotAllowed)
    }
}
```

2. **Add Route** (`backend/internal/router/router.go`)
```go
http.HandleFunc("/api/feature", middleware.EnableCORS(h.FeatureHandler))
```

3. **Add Model with Validation** (`backend/internal/models/models.go` and `validation.go`)
```go
type Feature struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
}

func (f *Feature) Validate() error {
    if f.Name == "" {
        return errors.New("name required")
    }
    return nil
}
```

4. **Add Storage Methods** (`backend/internal/storage/datastore.go`)
```go
func (ds *DataStore) GetFeatures() []models.Feature {
    ds.mu.RLock()
    defer ds.mu.RUnlock()
    return ds.features
}
```

5. **Add API Method** (`frontend/src/services/api.js`)
```javascript
getFeature: () => request('/feature'),
```

6. **Use in Component** (`frontend/src/pages/Feature.jsx`)
```jsx
import { useEffect, useState } from 'react';
import api from '../services/api.js';

export function Feature() {
    const [data, setData] = useState([]);
    
    useEffect(() => {
        api.getFeature().then(setData);
    }, []);
    
    return <div>{/* render data */}</div>;
}
```

### Environment Variables

Development setup:
```bash
# Debug logging
DEBUG=true LOG_LEVEL=debug go run ./cmd/server

# Custom data directory
DATA_DIR=/tmp/finance-data go run ./cmd/server

# Production
PORT=8080 LOG_LEVEL=error go run ./cmd/server
```

### Logging in Code

```go
// In handlers or storage operations
log.Info("Operation completed for user: %s", userID)
log.Error("Failed to save data: %v", err)
log.Debug("Processing request with ID: %s", requestID)
```

### Error Handling Pattern

```go
// Validate input
if err := model.Validate(); err != nil {
    middleware.ErrorResponse(w, fmt.Sprintf("Validation error: %v", err), http.StatusBadRequest)
    return
}

// Perform operation
if err := h.store.AddModel(model); err != nil {
    middleware.ErrorResponse(w, fmt.Sprintf("Failed to add model: %v", err), http.StatusInternalServerError)
    return
}

// Success response
middleware.JSONResponse(w, model, http.StatusCreated)
```

### Testing with Mock Storage

```go
type MockStorage struct {
    investments []models.Investment
}

func (m *MockStorage) GetInvestments() []models.Investment {
    return m.investments
}

func (m *MockStorage) AddInvestment(inv models.Investment) error {
    m.investments = append(m.investments, inv)
    return nil
}

// Use in tests
func TestCreateInvestment(t *testing.T) {
    mock := &MockStorage{}
    h := handlers.NewHandler(mock)
    // Test handler with mock storage
}
```
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
