# Configuration Guide

## Overview
The Finance Tracker backend now supports configuration via both JSON file and environment variables, with environment variables taking precedence.

## Configuration File

### Location
```
backend/config/config.json
```

### Format
```json
{
    "port": "5000",
    "data_dir": "./data",
    "log_level": "info",
    "log_dir": "./logs",
    "debug": false
}
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `port` | string | `"5000"` | HTTP server port number |
| `data_dir` | string | `"./data"` | Directory for storing data files |
| `log_level` | string | `"info"` | Logging level: `debug`, `info`, `warn`, `error` |
| `log_dir` | string | `"./logs"` | Directory for storing log files |
| `debug` | boolean | `false` | Enable debug mode |

## Loading Priority

Configuration is loaded in the following order (later sources override earlier ones):

1. **Default values** (hardcoded in `config.go`)
2. **JSON file** (`config/config.json`)
3. **Environment variables** (highest priority)

### Example
```json
// config.json
{
    "port": "5000",
    "log_level": "info"
}
```

```bash
# Environment variable overrides JSON
export PORT=8080
export LOG_LEVEL=debug

# Server will use:
# - Port: 8080 (from env)
# - Log Level: debug (from env)
```

## Environment Variables

All JSON settings can be overridden with environment variables:

```bash
export PORT="8080"              # Server port
export DATA_DIR="./my-data"     # Data directory
export LOG_LEVEL="debug"        # Log level
export LOG_DIR="./my-logs"      # Log directory
export DEBUG="true"             # Debug mode
```

### Windows (PowerShell)
```powershell
$env:PORT="8080"
$env:LOG_LEVEL="debug"
$env:DEBUG="true"
```

### Linux/Mac (Bash)
```bash
export PORT=8080
export LOG_LEVEL=debug
export DEBUG=true
```

## Log Levels

Configure logging verbosity:

| Level | Value | Description |
|-------|-------|-------------|
| DEBUG | `"debug"` | Most verbose - all messages including debug info |
| INFO | `"info"` | Standard - informational messages (default) |
| WARN | `"warn"` | Warnings only - potential issues |
| ERROR | `"error"` | Errors only - critical problems |

### Example Configurations

**Development (Verbose)**
```json
{
    "port": "5000",
    "log_level": "debug",
    "debug": true
}
```

**Production (Minimal)**
```json
{
    "port": "80",
    "log_level": "warn",
    "debug": false
}
```

**Testing (Custom Port)**
```json
{
    "port": "3000",
    "log_level": "info",
    "data_dir": "./test-data"
}
```

## Verification

When the server starts, it logs the loaded configuration:

```
2025/12/02 13:21:45 Configuration loaded from: config/config.json
[2025-12-02 13:21:45] INFO: Configuration: Port=5000, DataDir=./data, LogLevel=info, LogDir=./logs
```

This helps verify which settings are active.

## Configuration Management

### Programmatic Updates

The configuration can be saved programmatically:

```go
import "finance-tracker/internal/config"

cfg := config.Load()
cfg.Port = "8080"
cfg.LogLevel = "debug"

// Save to file
if err := cfg.Save(); err != nil {
    log.Error("Failed to save config: %v", err)
}
```

### Manual Editing

1. Open `backend/config/config.json` in any text editor
2. Modify values as needed
3. Save the file
4. Restart the server for changes to take effect

## Best Practices

### 1. **Use JSON for Defaults**
Store common settings in `config.json`:
```json
{
    "port": "5000",
    "log_level": "info",
    "debug": false
}
```

### 2. **Use Environment Variables for Overrides**
Override settings per environment without changing the file:
```bash
# Development
export LOG_LEVEL=debug
export DEBUG=true

# Production
export LOG_LEVEL=warn
export PORT=80
```

### 3. **Version Control**
- **Commit** `config.json` with sensible defaults
- **Don't commit** sensitive values (use env vars)
- **Document** any required environment variables

### 4. **Security**
- Never commit secrets or API keys to `config.json`
- Use environment variables for sensitive data
- Restrict file permissions: `chmod 600 config.json`

## Troubleshooting

### Config file not found
```
2025/12/02 13:21:45 Config file not found at config/config.json. Using defaults.
```
**Solution**: Create `backend/config/config.json` or let the app use defaults.

### Invalid JSON
```
2025/12/02 13:21:45 Warning: Failed to parse config.json: invalid character...
```
**Solution**: Validate JSON syntax using a JSON linter or editor.

### Port already in use
```
[2025-12-02 13:21:45] ERROR: Server error: listen tcp :5000: bind: address already in use
```
**Solution**: Change port in config.json or stop the conflicting process.

## Migration from Environment-Only

Previously, the app only used environment variables. Now:

**Old way (still works):**
```bash
export PORT=5000
export LOG_LEVEL=info
go run ./cmd/server/main.go
```

**New way (recommended):**
```json
// config.json
{
    "port": "5000",
    "log_level": "info"
}
```
```bash
go run ./cmd/server/main.go
```

Both methods work and can be combined!

## Related Documentation

- [Logging System](./logs/README.md) - Detailed logging documentation
- [Development Guide](../../docs/DEVELOPMENT.md) - Development workflow
- [Architecture](../../docs/ARCHITECTURE.md) - System architecture

## Future Enhancements

Potential improvements:
- [ ] Hot reload configuration without restart
- [ ] Configuration validation with schema
- [ ] Support for YAML/TOML formats
- [ ] Configuration profiles (dev, staging, prod)
- [ ] Encrypted configuration values
- [ ] Configuration API endpoint
