# Architecture Overview

## Project Organization

The Finance Tracker follows Go best practices with a clean, scalable, production-ready architecture.

## Directory Explanation

### `/backend`
The backend contains all Go microservice code organized in a maintainable structure:

- **`/cmd/server`** - Application entry point
  - Contains `main.go` which initializes and starts the server
  - Loads configuration from environment variables
  - Initializes logger and storage
  - Starts HTTP server with all routes

- **`/internal`** - Private code packages
  - Not importable by external packages (enforced by Go)
  - Contains all business logic and implementation details

  - **`/config`** - Configuration management
    - Loads settings from environment variables
    - Support for: PORT, DATA_DIR, LOG_LEVEL, DEBUG
    - Sensible defaults for all settings

  - **`/logger`** - Structured logging
    - Custom logger with log levels: Debug, Info, Warn, Error
    - Consistent timestamp format `[YYYY-MM-DD HH:MM:SS]`
    - Environment-based log level control

  - **`/handlers`** - HTTP request handlers
    - Handler struct with dependency injection (Storage interface)
    - Separate methods for each API endpoint
    - Input validation before storage operations
    - Comprehensive error handling with detailed messages
    - All methods properly handle and return errors

  - **`/models`** - Data structures
    - Investment, Expense, Settings types
    - `Validate()` methods for input validation
    - JSON serialization tags for API responses

  - **`/storage`** - Data persistence layer
    - `interface.go` - Abstract Storage interface
    - `datastore.go` - DataStore implementation with thread-safe RWMutex
    - JSON file-based persistence (investments.json, expenses.json, settings.json)
    - Get, Add, Update, Delete operations with error returns
    - Export/Import functionality

  - **`/middleware`** - Middleware & response helpers
    - `middleware.go` - EnableCORS for cross-origin support
    - `response.go` - Standardized API response format with success/error/message

  - **`/router`** - Route definitions
    - RegisterRoutes function maps URLs to handlers
    - Dependency injection of Storage interface
    - CORS middleware applied to all routes
    - 12 API endpoints for investments, expenses, settings, export/import

- **`/config`** - Configuration files
  - `config.json` - Future app settings expansion

- **`/data`** - Runtime data (generated at runtime)
  - `investments.json` - Persisted investments
  - `expenses.json` - Persisted expenses
  - `settings.json` - Persisted app settings

### `/frontend`
React application for the UI:

- **`/src/components`** - Reusable React components
  - Dashboard, forms, tables, etc.

- **`/src/pages`** - Page-level components
  - Each page can have multiple components

- **`/src/services`** - API communication
  - `api.js` - All backend API calls

- **`/src/hooks`** - Custom React hooks
  - Reusable state logic

- **`/src/utils`** - Helper functions
  - Formatting, calculations, etc.

- **`/src/assets`** - Static files
  - Images, fonts, etc.

## Request Flow

```
User Browser
    ↓
Frontend (React)
    ↓
API Call (HTTP)
    ↓
CORS Middleware (EnableCORS)
    ↓
Handler (GetInvestments, CreateExpense, etc.)
    ↓
Validation (Investment.Validate(), Expense.Validate())
    ↓
Storage Interface (AddInvestment, UpdateExpense, etc.)
    ↓
DataStore Implementation (RWMutex protected)
    ↓
JSON Files (investments.json, expenses.json, settings.json)
    ↓
Response (Standardized format: {success, data, error})
    ↓
Frontend Receives Response
```

## Why This Structure?

1. **Scalability** - Easy to add more services or swap implementations
2. **Maintainability** - Clear separation of concerns
3. **Testability** - Interface-based design enables mocks
4. **Security** - `/internal` keeps implementation private
5. **Go Standards** - Follows Go conventions and best practices
6. **Configuration** - 12-factor app with environment variables
7. **Reliability** - Comprehensive error handling and logging

## Adding New Features

### Add a new Handler
1. Create file in `/backend/internal/handlers/`
2. Implement handler methods with proper validation
3. Add routes to `/backend/internal/router/router.go`

### Add a new Data Model
1. Add type to `/backend/internal/models/models.go`
2. Add Validate() method in `/backend/internal/models/validation.go`
3. Create handler methods
4. Add API endpoints to router

### Add new Frontend Page
1. Create component in `/frontend/src/pages/`
2. Add API methods in `/frontend/src/services/api.js`
3. Import and use in `App.jsx`

## API Response Format

### Success Response (2xx)
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Investment Name",
    "invested": 50000,
    "type": "Mutual Fund",
    "date": "2025-01-15"
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "success": false,
  "error": "Validation error: investment name is required"
}
```

## Configuration System

### Environment Variables
- `PORT` - Server port (default: 5000)
- `DATA_DIR` - Data directory (default: ./data)
- `LOG_LEVEL` - Logging level: debug/info/warn/error (default: info)
- `DEBUG` - Debug mode on/off (default: false)

### Usage Examples
```bash
# Development with debug logging
DEBUG=true LOG_LEVEL=debug go run ./cmd/server

# Production on custom port
PORT=8080 LOG_LEVEL=error go run ./cmd/server
```

## Data Persistence

### Current: JSON Files
- Simple, no external dependencies
- Located in `/data` directory
- Thread-safe with RWMutex
- Auto-created on first run

### Future: Database
- Easy migration via Storage interface
- Just implement DatabaseStorage struct
- No handler changes needed

## Key Design Patterns

### 1. Dependency Injection
- Handlers receive Storage interface (not concrete type)
- Enables testing with mock implementations
- Loosely coupled components

### 2. Interface-Based Design
```go
type Storage interface {
    GetInvestments() []models.Investment
    AddInvestment(inv models.Investment) error
    UpdateInvestment(id string, updated models.Investment) error
    // ... other methods
}
```

### 3. Error Handling
- All storage methods return errors
- Validation before storage operations
- Detailed error messages with context

### 4. Thread Safety
- RWMutex for concurrent access
- RLock for reads
- Exclusive Lock for writes

## Production Readiness Checklist

- ✅ Environment-based configuration
- ✅ Structured logging with levels
- ✅ Input validation
- ✅ Comprehensive error handling
- ✅ CORS properly configured
- ✅ Thread-safe operations
- ✅ Graceful error responses
- ✅ No global variables
- ✅ Dependency injection pattern
- ✅ Interface-based design
