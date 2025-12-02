# Finance Tracker - Go Microservice Starter

Track personal finance and expenses with a Go backend and React frontend.

## 📁 Project Structure

### Organized Go Backend Structure (Industry Standard)

```
backend/
├── cmd/
│   └── server/
│       └── main.go                 ← Application entry point
├── internal/                       ← Private code (not importable by others)
│   ├── handlers/
│   │   ├── authentication/
│   │   │   └── handlers.go         ← Auth endpoints
│   │   └── finance/
│   │       ├── handlers.go         ← Finance API endpoints
│   │       └── datastore.go        ← Data persistence
│   ├── middleware/                 ← Middleware (CORS, Auth, Logging)
│   ├── models/
│   │   └── finance.go              ← Data structures (Investment, Expense, etc.)
│   └── router/
│       └── router.go               ← Route definitions
├── pkg/                            ← Reusable packages
│   ├── logger/
│   │   └── logger.go               ← Logging utility
│   └── database/                   ← Database utilities (future)
├── config/
│   └── config.json                 ← Configuration file
├── data/                           ← Runtime data (generated)
│   ├── investments.json
│   ├── expenses.json
│   └── settings.json
├── go.mod                          ← Go module definition
└── go.sum                          ← Dependency lock file
```

### Organized React Frontend Structure

```
frontend/
├── src/
│   ├── components/                 ← Reusable React components
│   ├── pages/                      ← Page components
│   ├── services/
│   │   └── api.js                  ← Backend API calls
│   ├── hooks/                      ← Custom React hooks
│   ├── utils/                      ← Utility functions
│   ├── assets/                     ← Images, fonts, etc.
│   ├── App.jsx                     ← Main app component
│   ├── App.css                     ← Global styles
│   ├── index.css                   ← Base styles
│   └── main.jsx                    ← React entry point
├── public/                         ← Static files
├── index.html                      ← HTML template
├── package.json                    ← Dependencies
└── vite.config.js                  ← Vite configuration
```

## 🚀 Quick Start

### Prerequisites
- **Go** 1.22+
- **Node.js** 16+
- **npm** or **yarn**

### Backend Setup

```bash
# Navigate to backend
cd backend

# Download dependencies
go mod download

# Run the server
go run ./cmd/server/main.go
```

Server runs on: `http://localhost:4100`

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend runs on: `http://localhost:5173`

## 📝 Configuration

### Backend Logger (`backend/config/config.json`)
```json
{
    "log_level": "info"  // Options: debug, info, warn, error
}
```

Logs are written to: `backend/log/application.log`

## 🏗️ Architecture

### Backend Layers

1. **cmd/server** - Application entry point
2. **internal/router** - HTTP routes and middleware
3. **internal/handlers** - Business logic and API endpoints
4. **internal/models** - Data structures
5. **pkg/logger** - Logging functionality
6. **pkg/database** - Database utilities (expandable)

### Frontend Layers

1. **pages** - Full page components
2. **components** - Reusable UI components
3. **services** - API communication
4. **hooks** - Custom React hooks
5. **utils** - Helper functions

## 📚 Key Dependencies

### Backend
- `gorilla/mux` - HTTP router
- `google/uuid` - UUID generation
- `uber/zap` - Structured logging

### Frontend
- `react` - UI framework
- `vite` - Build tool

## 🔗 API Endpoints

### Investments
- `GET /api/investments` - List all investments
- `POST /api/investments` - Create investment
- `PUT /api/investments/{id}` - Update investment
- `DELETE /api/investments/{id}` - Delete investment

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Settings
- `GET /api/settings` - Get app settings
- `PUT /api/settings` - Update settings

### Data
- `GET /api/export` - Export all data
- `POST /api/import` - Import data

## 📦 Data Format

### Investment
```json
{
  "id": "uuid",
  "name": "HDFC Mutual Fund",
  "type": "Mutual Fund",
  "invested": 50000,
  "current": 52000,
  "date": "2024-01-15",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T15:45:00Z"
}
```

### Expense
```json
{
  "id": "uuid",
  "desc": "Grocery shopping",
  "amount": 2500,
  "category": "Food",
  "date": "2024-01-15",
  "addedBy": "Ravi",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

## 🔧 Development

### Adding New Feature

**Backend:**
1. Define model in `internal/models/`
2. Create handler in `internal/handlers/`
3. Add routes in `internal/router/router.go`

**Frontend:**
1. Add API methods in `frontend/src/services/api.js`
2. Create component in `frontend/src/components/`
3. Use in pages or other components

## 📝 Notes

- Backend data persists in JSON files (no database required for now)
- CORS is enabled for frontend-backend communication
- All timestamps use RFC3339 format
- IDs are generated using UUID v4

## 🤝 Contributing

Follow the folder structure when adding new features. Keep components modular and reusable.

## 📄 License

This is a personal finance tracker project.
# Terminal 1 - Backend
cd backend
go run main.go

# Terminal 2 - Frontend
cd frontend
npm run dev

# Open browser: http://localhost:5173

# Start Backend (Terminal 1)

cd finance-tracker/backend
go run main.go
```

**Expected output:**
```
✅ Backend running at http://localhost:5000
📁 Data stored in: ./data

API Endpoints:
  GET/POST   /api/investments
  ...

# Start Frontend (Terminal 2)

cd finance-tracker/frontend
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173
  ➜  Network: http://192.168.x.x:5173
```

## 4.3: Open Browser

Go to: **http://localhost:5173**

---