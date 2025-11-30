# finance-tracker
track my personal finance and expenses


# Complete Folder Structure
```
finance-tracker/
│
├── backend/
│   ├── main.go              ← Go server (copy from artifact)
│   ├── go.mod               ← Created by: go mod init
│   ├── go.sum               ← Created automatically
│   └── data/                ← Created automatically when server runs
│       ├── investments.json
│       ├── expenses.json
│       └── settings.json
│
└── frontend/
    ├── package.json         ← Created by: npm create vite
    ├── vite.config.js       ← Vite configuration
    ├── index.html           ← HTML entry point
    └── src/
        ├── main.jsx         ← React entry point (auto-created)
        ├── api.js           ← API service (copy from artifact)
        ├── App.jsx          ← Main component (copy from artifact)
        └── App.css          ← Styles (copy from artifact)

# Quick Commands Summary:

# FIRST TIME SETUP

# 1. Create folders
mkdir finance-tracker
cd finance-tracker
mkdir backend frontend

# 2. Setup backend
cd backend
go mod init finance-tracker
go get github.com/google/uuid
# Create main.go file (copy from artifact)

# 3. Setup frontend
cd ../frontend
npm create vite@latest . -- --template react
npm install
# Create src/api.js, src/App.jsx, src/App.css (copy from artifacts)

# RUNNING THE APP

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