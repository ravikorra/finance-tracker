# Project Structure Tree

## Complete New Structure

```
go-microservice-starter/
│
├── backend/                                    ← All Go code here
│   ├── cmd/
│   │   └── server/
│   │       └── main.go                        ★ Start here
│   │
│   ├── internal/                              ← Private packages
│   │   ├── handlers/
│   │   │   ├── authentication/
│   │   │   │   └── handlers.go
│   │   │   └── finance/
│   │   │       ├── handlers.go
│   │   │       └── datastore.go
│   │   ├── models/
│   │   │   └── finance.go
│   │   ├── middleware/                        ← Placeholder for future
│   │   └── router/
│   │       └── router.go
│   │
│   ├── pkg/                                   ← Reusable packages
│   │   ├── logger/
│   │   │   └── logger.go
│   │   └── database/                          ← Placeholder for future
│   │
│   ├── config/
│   │   └── config.json
│   │
│   ├── data/                                  ← Runtime data
│   │   ├── investments.json                   (generated at runtime)
│   │   ├── expenses.json
│   │   └── settings.json
│   │
│   ├── log/
│   │   └── application.log
│   │
│   ├── go.mod
│   └── go.sum
│
├── frontend/                                  ← React app
│   ├── src/
│   │   ├── services/
│   │   │   └── api.js                        ← Backend API calls
│   │   ├── components/                        ← Reusable components
│   │   ├── pages/                             ← Page components
│   │   ├── hooks/                             ← Custom hooks
│   │   ├── utils/                             ← Helpers
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── docs/                                      ← Documentation
│   ├── ARCHITECTURE.md                        (How it's organized)
│   ├── DEVELOPMENT.md                         (Dev guide)
│   └── MIGRATION.md                           (What changed)
│
├── scripts/                                   ← Helper scripts
│   ├── setup.sh                               (Initial setup)
│   ├── start-backend.sh                       (Run backend)
│   └── start-frontend.sh                      (Run frontend)
│
├── Makefile                                   ← Commands
├── README.md                                  ← Updated docs
├── .gitignore                                 ← Git exclusions
├── Dockerfile                                 ← Docker config
├── REORGANIZATION_COMPLETE.md                 ← This summary
│
├── cmd/                                       (Old - can delete)
├── log/                                       (Old - can delete)
├── router/                                    (Old - can delete)
├── services/                                  (Old - can delete)
├── cofigurationFiles/                         (Old - can delete)
└── .git/
```

## Data Flow

```
CLIENT BROWSER
     ↓
┌────────────────────────────────────────────────┐
│ FRONTEND (React)                               │
│ ├── Components (src/components/)               │
│ ├── Pages (src/pages/)                         │
│ ├── API Service (src/services/api.js)          │
│ └── Hooks & Utils (src/hooks/, src/utils/)     │
└────────────────┬─────────────────────────────┘
                 │ HTTP Request (fetch)
                 ↓
┌────────────────────────────────────────────────┐
│ BACKEND (Go)                                   │
│ ├── Router (internal/router/router.go)         │
│ ├── Handlers (internal/handlers/)              │
│ ├── Models (internal/models/)                  │
│ └── Logger (pkg/logger/)                       │
└────────────────┬─────────────────────────────┘
                 │ Database/File Operations
                 ↓
┌────────────────────────────────────────────────┐
│ DATA LAYER                                     │
│ ├── investments.json                           │
│ ├── expenses.json                              │
│ └── settings.json                              │
└────────────────────────────────────────────────┘
```

## Package Organization

```
INTERNAL (Private)
├── handlers/          ← HTTP request handling
├── models/            ← Data structures
├── middleware/        ← Request/response processing
└── router/            ← Route definitions

PKG (Reusable)
├── logger/            ← Logging utilities
└── database/          ← Database utilities (future)

CMD
└── server/            ← Application entry point
```

## Directory Responsibilities

| Directory | Responsibility |
|-----------|----------------|
| `backend/cmd/server/` | Main application - starts server, initializes components |
| `backend/internal/handlers/` | Business logic - processes requests, calls datastore |
| `backend/internal/models/` | Data definitions - Investment, Expense, Settings types |
| `backend/internal/router/` | Route mapping - connects URLs to handlers |
| `backend/pkg/logger/` | Logging - structured logging with configuration |
| `backend/config/` | Configuration - app settings, log level, etc. |
| `backend/data/` | Persistence - JSON files with actual data |
| `frontend/src/components/` | UI Building blocks - buttons, forms, tables, etc. |
| `frontend/src/pages/` | Page layouts - dashboard, investment page, etc. |
| `frontend/src/services/` | Backend communication - API calls |
| `frontend/src/hooks/` | Reusable logic - state management, custom logic |
| `frontend/src/utils/` | Helpers - formatting, calculations, etc. |
| `docs/` | Documentation - guides and references |
| `scripts/` | Automation - startup and setup scripts |

## How to Navigate

**Finding a specific API endpoint?**
→ Look in `backend/internal/router/router.go` then `backend/internal/handlers/[feature]/handlers.go`

**Understanding data structure?**
→ Check `backend/internal/models/`

**Need to debug logs?**
→ View `backend/log/application.log`

**Want to add new feature?**
→ Create new handler in `backend/internal/handlers/`, add route in router, create frontend component

**Need API documentation?**
→ Check `README.md` for endpoints or `docs/ARCHITECTURE.md` for design

---

**Happy coding! 🚀**
