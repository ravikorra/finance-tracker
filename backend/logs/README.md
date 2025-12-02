# Backend Logging System

## Overview
The Finance Tracker backend now includes a comprehensive file-based logging system with automatic daily log rotation.

## Features

### ✅ Dual Output
- Logs are written to **both console and file** simultaneously
- Console output for real-time monitoring
- File output for persistence and debugging

### ✅ Daily Log Rotation
- New log file created automatically each day
- Filename format: `app-YYYY-MM-DD.log`
- Example: `app-2025-12-02.log`
- Automatic rotation at midnight

### ✅ Log Levels
Supports four log levels (in order of severity):
1. **DEBUG** - Detailed diagnostic information
2. **INFO** - General informational messages
3. **WARN** - Warning messages
4. **ERROR** - Error messages

### ✅ Graceful Shutdown
- Proper log file closure on server shutdown
- Signal handling for SIGINT and SIGTERM

## Usage

### In Code
```go
import "finance-tracker/internal/logger"

// Create logger
log := logger.New("info", false)
defer log.Close()

// Log messages
log.Debug("Detailed debug information")
log.Info("Server started on port %s", port)
log.Warn("High memory usage detected")
log.Error("Failed to connect: %v", err)
```

### Log File Location
```
backend/logs/app-YYYY-MM-DD.log
```

### Configuration
Set log level via environment variable:
```bash
export LOG_LEVEL=debug  # debug, info, warn, error
export DEBUG=true       # Enable debug mode
```

## Log File Management

### Viewing Logs
```bash
# View today's log
cat backend/logs/app-$(date +%Y-%m-%d).log

# Tail real-time logs
tail -f backend/logs/app-$(date +%Y-%m-%d).log

# Search logs
grep "ERROR" backend/logs/*.log
```

### Log Retention
Log files are retained indefinitely by default. Consider implementing:
- Manual cleanup of old logs
- Automated cleanup script (e.g., keep last 30 days)
- Log aggregation service

### Example Cleanup Script
```bash
# Delete logs older than 30 days
find backend/logs -name "app-*.log" -mtime +30 -delete
```

## Git Configuration

Log files are automatically ignored in version control:
- Individual log files: `backend/logs/*.log`
- Directory structure is preserved via `.gitignore`

## Log Format

Each log entry follows this format:
```
[YYYY-MM-DD HH:MM:SS] LEVEL: message
```

Example:
```
[2025-12-02 12:38:11] INFO: Data store initialized at ./data
[2025-12-02 12:38:11] INFO: Routes registered
[2025-12-02 12:38:11] INFO: Starting server on port 5000
```

## Implementation Details

### Logger Structure
- **Multi-writer**: Writes to both stdout and file
- **Rotation check**: Validates date before each log write
- **File handling**: Proper open/close with error handling
- **Thread-safe**: Standard library logger is thread-safe

### Performance
- Minimal overhead with buffered I/O
- Efficient rotation check (string comparison)
- No blocking operations

## Troubleshooting

### Logs not appearing in file
1. Check if `backend/logs/` directory exists
2. Verify file permissions (needs write access)
3. Ensure logger is properly initialized with `defer log.Close()`

### Permission errors
```bash
chmod 755 backend/logs/
```

### Disk space issues
Monitor log directory size:
```bash
du -sh backend/logs/
```

## Future Enhancements

Potential improvements:
- [ ] Log compression for old files
- [ ] Size-based rotation (e.g., 100MB max per file)
- [ ] Log level filtering per package/module
- [ ] Structured logging (JSON format)
- [ ] Integration with log aggregation services (ELK, Datadog, etc.)
- [ ] Log metrics and analytics
