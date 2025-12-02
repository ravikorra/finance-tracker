# Health Check and API Versioning Implementation

**Date**: December 2, 2025  
**Status**: ✅ Implemented

## Overview

This document describes the implementation of health check endpoint and API versioning (v1) for the Finance Tracker application.

## Changes Implemented

### 1. Health Check Endpoint

**Purpose**: Allow clients to verify backend availability before making API calls

**Backend Changes**:
- Added `HealthCheck()` handler in `backend/internal/handlers/handlers.go`
- Registered `/health` endpoint in `backend/internal/router/router.go`
- Returns server status, version, and timestamp

**Endpoint**:
```
GET /health
```

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "service": "finance-tracker-api",
    "time": "2025-12-02T17:30:00+05:30"
  }
}
```

### 2. API Versioning

**Purpose**: Enable future API changes without breaking existing clients

**Changes**:
- All API endpoints now prefixed with `/v1/api` instead of `/api`
- Health check endpoint remains unversioned (`/health`) for universal access

**New Endpoint Structure**:
```
Before: /api/investments
After:  /v1/api/investments
```

**All Versioned Endpoints**:
```
GET/POST   /v1/api/investments
PUT/DELETE /v1/api/investments/{id}
GET/POST   /v1/api/expenses
PUT/DELETE /v1/api/expenses/{id}
GET/PUT    /v1/api/settings
GET        /v1/api/export
POST       /v1/api/import
```

### 3. Frontend Health Check Integration

**File**: `frontend/src/api.js`

**New Features**:
- `checkBackendHealth()` function with 3-second timeout
- Updated `BASE_URL` from `/api` to `/v1/api`
- Added request timeouts (10 seconds for API calls)
- Better error handling for timeouts and connection failures

**Usage**:
```javascript
const isHealthy = await api.checkHealth();
if (!isHealthy) {
  // Handle backend unavailable scenario
}
```

### 4. Smart Data Loading

**File**: `frontend/src/App.jsx`

**Behavior**:
- Checks backend health BEFORE making any API calls
- If backend is down:
  - Shows user-friendly error message
  - Prevents multiple failed API requests
  - Saves bandwidth and network resources
- If backend is healthy:
  - Proceeds with normal data loading

**User Experience**:
```
Backend Down:  Shows "⚠️ Backend server is not running. Please start the server on port 5000."
Backend Up:    Loads data normally
```

## Benefits

### 1. **Prevents Network Spam**
- No more multiple failed requests when backend is down
- Only one health check fails instead of 3+ API calls

### 2. **Better User Experience**
- Clear, actionable error message
- Faster feedback (3-second health check vs waiting for multiple timeouts)

### 3. **Future-Proof**
- Can introduce v2 API without breaking existing clients
- Health check endpoint version-agnostic

### 4. **Operational Monitoring**
- Health endpoint can be used for:
  - Load balancer health checks
  - Monitoring tools (Prometheus, Datadog, etc.)
  - Uptime monitoring services
  - DevOps automation

## Testing

### Test Health Check (Backend Down)
1. Keep backend stopped
2. Open frontend (`http://localhost:5173`)
3. Expected: One failed `/health` request, clear error message
4. Verify: No requests to `/v1/api/investments`, `/v1/api/expenses`, `/v1/api/settings`

### Test Health Check (Backend Up)
1. Start backend: `go run main.go`
2. Open frontend
3. Expected: 
   - `/health` returns 200 OK
   - All `/v1/api/*` endpoints return data successfully

### Test API Versioning
```bash
# Health check (no version)
curl http://localhost:5000/health

# Get investments (v1)
curl http://localhost:5000/v1/api/investments
```

## Files Modified

### Backend
- `backend/internal/handlers/handlers.go` - Added HealthCheck handler
- `backend/internal/router/router.go` - Added /health route, versioned API routes
- `backend/cmd/server/main.go` - Updated endpoint documentation

### Frontend
- `frontend/src/api.js` - Added health check, timeouts, versioned BASE_URL
- `frontend/src/App.jsx` - Health check before data loading

## Future Enhancements

### Phase 2 (Optional)
- [ ] Add database connection check to health endpoint
- [ ] Add `/ready` endpoint (readiness vs liveness)
- [ ] Include metrics in health response (uptime, request count)
- [ ] Add `/v1/api/version` endpoint for detailed version info
- [ ] Implement retry logic with exponential backoff
- [ ] Add offline mode with localStorage caching

### Phase 3 (Production)
- [ ] Add authentication token to health endpoint
- [ ] Implement rate limiting
- [ ] Add distributed tracing (OpenTelemetry)
- [ ] Create v2 API with breaking changes (demonstrate versioning)

## Migration Guide

For existing deployments, update frontend environment:

```bash
# Old
API_URL=http://localhost:5000/api

# New
API_URL=http://localhost:5000/v1/api
HEALTH_URL=http://localhost:5000/health
```

## References

- [REST API Versioning Best Practices](https://restfulapi.net/versioning/)
- [Health Check Pattern](https://microservices.io/patterns/observability/health-check-api.html)
- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
