package logger

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	Logger *zap.Logger
)

const (
	logFilePath  = "backend/log/application.log"
	configPath   = "backend/config/config.json"
	defaultLevel = zapcore.InfoLevel // Default log level
)

// Config structure to hold configuration data
type Config struct {
	LogLevel string `json:"log_level"`
}

// Initialize sets up the logger to write logs to a file with the log level from config
func Initialize() error {
	// Load the log level from the configuration file
	logLevel, err := loadLogLevel()
	if err != nil {
		return err
	}

	// Create log directory if it doesn't exist
	logDir := filepath.Dir(logFilePath)
	if _, err := os.Stat(logDir); os.IsNotExist(err) {
		if mkdirErr := os.MkdirAll(logDir, 0755); mkdirErr != nil {
			return mkdirErr
		}
	}

	// Create a file write syncer
	file, err := os.OpenFile(logFilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	fileWriteSyncer := zapcore.AddSync(file)

	// Set up the encoder (Plain text format with desired fields)
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:      "timestamp",
		LevelKey:     "level",
		MessageKey:   "message",
		CallerKey:    "caller",
		EncodeTime:   millisecondTimeEncoder, // Custom time format
		EncodeLevel:  zapcore.CapitalLevelEncoder,
		EncodeCaller: zapcore.ShortCallerEncoder,
	}

	// Add a log level enabler
	levelEnabler := zap.LevelEnablerFunc(func(level zapcore.Level) bool {
		return level >= logLevel // Only enable logs at or above the configured level
	})

	// Create a core with the encoder and file write syncer
	core := zapcore.NewCore(
		zapcore.NewConsoleEncoder(encoderConfig), // Use plain text encoding
		fileWriteSyncer,                          // Write logs to file
		levelEnabler,                             // Log level from config
	)

	// Build the logger
	Logger = zap.New(core, zap.AddCaller(), zap.AddCallerSkip(1))
	return nil
}

// Debug logs a debug-level message
func Debug(message string, fields ...zap.Field) {
	Logger.Debug(message, fields...)
}

// Info logs an info-level message
func Info(message string, fields ...zap.Field) {
	Logger.Info(message, fields...)
}

// Error logs an error-level message
func Error(message string, fields ...zap.Field) {
	Logger.Error(message, fields...)
}

// Warn logs a warning-level message
func Warn(message string, fields ...zap.Field) {
	Logger.Warn(message, fields...)
}

// Sync flushes any buffered log entries
func Sync() error {
	if Logger != nil {
		return Logger.Sync()
	}
	return nil
}

// loadLogLevel loads the log level from the config file
func loadLogLevel() (zapcore.Level, error) {
	file, err := os.Open(configPath)
	if err != nil {
		// If config file doesn't exist, use default level
		return defaultLevel, nil
	}
	defer file.Close()

	var cfg Config
	if err := json.NewDecoder(file).Decode(&cfg); err != nil {
		return defaultLevel, err
	}

	level := defaultLevel
	levelStr := strings.ToLower(strings.TrimSpace(cfg.LogLevel))

	switch levelStr {
	case "debug":
		level = zapcore.DebugLevel
	case "info":
		level = zapcore.InfoLevel
	case "warn":
		level = zapcore.WarnLevel
	case "error":
		level = zapcore.ErrorLevel
	default:
		level = defaultLevel
	}

	return level, nil
}

// millisecondTimeEncoder encodes the time in milliseconds format
func millisecondTimeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	enc.AppendString(t.Format("2006-01-02 15:04:05.000"))
}
