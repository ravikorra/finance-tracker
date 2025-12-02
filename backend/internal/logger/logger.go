package logger

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger provides structured logging with Zap
type Logger struct {
	zapLogger  *zap.Logger
	sugar      *zap.SugaredLogger
	logFile    *os.File
	logDir     string
	currentDay string
}

// New creates a new Zap logger with file output and console output
func New(logLevel string, debug bool, logDir string) *Logger {
	// Use default if not specified
	if logDir == "" {
		logDir = "logs"
	}

	// Create logs directory if it doesn't exist
	if err := os.MkdirAll(logDir, 0755); err != nil {
		fmt.Printf("Failed to create logs directory: %v\n", err)
	}

	logger := &Logger{
		logDir: logDir,
	}

	// Initialize Zap logger
	logger.initZapLogger(logLevel, debug)

	return logger
}

// initZapLogger initializes the Zap logger with file and console output
func (l *Logger) initZapLogger(logLevel string, debug bool) {
	today := time.Now().Format("2006-01-02")
	l.currentDay = today

	// Create log file
	logFileName := filepath.Join(l.logDir, fmt.Sprintf("app-%s.log", today))
	logFile, err := os.OpenFile(logFileName, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		fmt.Printf("Failed to open log file: %v\n", err)
		// Fall back to console only
		l.zapLogger = zap.Must(zap.NewProduction())
		l.sugar = l.zapLogger.Sugar()
		return
	}
	l.logFile = logFile

	// Parse log level
	level := parseZapLevel(logLevel)

	// Configure encoder
	encoderConfig := zapcore.EncoderConfig{
		TimeKey:        "time",
		LevelKey:       "level",
		NameKey:        "logger",
		CallerKey:      "caller",
		FunctionKey:    zapcore.OmitKey,
		MessageKey:     "msg",
		StacktraceKey:  "stacktrace",
		LineEnding:     zapcore.DefaultLineEnding,
		EncodeLevel:    zapcore.CapitalColorLevelEncoder,
		EncodeTime:     zapcore.ISO8601TimeEncoder,
		EncodeDuration: zapcore.StringDurationEncoder,
		EncodeCaller:   zapcore.ShortCallerEncoder,
	}

	// Console encoder (colored output)
	consoleEncoder := zapcore.NewConsoleEncoder(encoderConfig)

	// File encoder (JSON for easier parsing)
	fileEncoderConfig := encoderConfig
	fileEncoderConfig.EncodeLevel = zapcore.CapitalLevelEncoder
	fileEncoder := zapcore.NewJSONEncoder(fileEncoderConfig)

	// Create core that writes to both console and file
	core := zapcore.NewTee(
		zapcore.NewCore(consoleEncoder, zapcore.AddSync(os.Stdout), level),
		zapcore.NewCore(fileEncoder, zapcore.AddSync(logFile), level),
	)

	// Create logger
	opts := []zap.Option{zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel)}
	if debug {
		opts = append(opts, zap.Development())
	}

	l.zapLogger = zap.New(core, opts...)
	l.sugar = l.zapLogger.Sugar()
}

// checkRotation checks if log file needs rotation (new day)
func (l *Logger) checkRotation() {
	today := time.Now().Format("2006-01-02")
	if today != l.currentDay {
		if l.logFile != nil {
			l.logFile.Close()
		}
		l.zapLogger.Sync()
		l.initZapLogger("info", false)
	}
}

// Close closes the log file and syncs the logger
func (l *Logger) Close() {
	if l.zapLogger != nil {
		l.zapLogger.Sync()
	}
	if l.logFile != nil {
		l.logFile.Close()
	}
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, args ...interface{}) {
	l.checkRotation()
	l.sugar.Debugf(msg, args...)
}

// Info logs an info message
func (l *Logger) Info(msg string, args ...interface{}) {
	l.checkRotation()
	l.sugar.Infof(msg, args...)
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, args ...interface{}) {
	l.checkRotation()
	l.sugar.Warnf(msg, args...)
}

// Error logs an error message
func (l *Logger) Error(msg string, args ...interface{}) {
	l.checkRotation()
	l.sugar.Errorf(msg, args...)
}

// With returns a logger with additional context fields
func (l *Logger) With(fields ...interface{}) *Logger {
	return &Logger{
		zapLogger:  l.zapLogger,
		sugar:      l.sugar.With(fields...),
		logFile:    l.logFile,
		logDir:     l.logDir,
		currentDay: l.currentDay,
	}
}

// parseZapLevel converts string to zapcore.Level
func parseZapLevel(levelStr string) zapcore.Level {
	switch strings.ToLower(levelStr) {
	case "debug":
		return zapcore.DebugLevel
	case "info":
		return zapcore.InfoLevel
	case "warn":
		return zapcore.WarnLevel
	case "error":
		return zapcore.ErrorLevel
	default:
		return zapcore.InfoLevel
	}
}
