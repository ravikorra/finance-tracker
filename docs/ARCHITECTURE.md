# Architecture Overview

## Project Organization

The Go-Microservice-Starter follows Go best practices with a clean, scalable architecture.

## Directory Explanation

### `/backend`
The backend contains all Go microservice code organized in a maintainable structure:

- **`/cmd/server`** - Application entry point
  - Contains `main.go` which initializes and starts the server
  - This is where program execution begins

- **`/internal`** - Private code packages
  - Not importable by external packages (enforced by Go)
  - Contains all business logic and implementation details

  - `/handlers` - HTTP request handlers
    - `/authentication` - Authentication-related endpoints
    - `/finance` - Finance API endpoints (investments, expenses, settings)
    
  - `/models` - Data structures
    - Defines Investment, Expense, Settings types
    - Shared across all handlers

  - `/router` - Route definitions
    - Maps URLs to handler functions
    - Sets up middleware and CORS

  - `/middleware` - Middleware functions (future)
    - Auth, logging, rate limiting, etc.

- **`/pkg`** - Reusable packages
  - Can be imported by other projects
  
  - `/logger` - Logging utilities
    - Structured logging with zap
    - Configuration from config file

  - `/database` - Database utilities (expandable)
    - Future: database connections, queries

- **`/config`** - Configuration files
  - `config.json` - App settings (log level, database URL, etc.)

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
API Call (fetch)
    ↓
Backend Router (gorilla/mux)
    ↓
Handler Function
    ↓
DataStore (JSON files)
    ↓
Response (JSON)
    ↓
Frontend (React)
    ↓
User Browser
```

## Why This Structure?

1. **Scalability** - Easy to add more services
2. **Maintainability** - Clear separation of concerns
3. **Reusability** - `/pkg` code can be used elsewhere
4. **Security** - `/internal` keeps implementation private
5. **Go Standards** - Follows Go conventions

## Adding New Features

### Add a new Handler
1. Create file in `/backend/internal/handlers/[feature]/`
2. Implement handler functions
3. Add routes to `/backend/internal/router/router.go`

### Add a new Data Model
1. Add type to `/backend/internal/models/`
2. Create handler for the model
3. Add API endpoints to router

### Add new Frontend Page
1. Create component in `/frontend/src/pages/`
2. Add API methods in `/frontend/src/services/api.js`
3. Import in `App.jsx`
