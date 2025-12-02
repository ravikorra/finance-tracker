package logger

import (
	"fmt"
	"log"
	"os"
	"strings"
	"time"
)

// Level represents the log level
type Level int

const (
	DebugLevel Level = iota
	InfoLevel
	WarnLevel
	ErrorLevel
)

// Logger provides structured logging
type Logger struct {
	level  Level
	debug  bool
	logger *log.Logger
}

// New creates a new logger
func New(logLevel string, debug bool) *Logger {
	level := parseLevel(logLevel)
	return &Logger{
		level:  level,
		debug:  debug,
		logger: log.New(os.Stdout, "", 0),
	}
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, args ...interface{}) {
	if l.level <= DebugLevel {
		l.log("DEBUG", msg, args...)
	}
}

// Info logs an info message
func (l *Logger) Info(msg string, args ...interface{}) {
	if l.level <= InfoLevel {
		l.log("INFO", msg, args...)
	}
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, args ...interface{}) {
	if l.level <= WarnLevel {
		l.log("WARN", msg, args...)
	}
}

// Error logs an error message
func (l *Logger) Error(msg string, args ...interface{}) {
	if l.level <= ErrorLevel {
		l.log("ERROR", msg, args...)
	}
}

// log outputs a formatted log message with timestamp
func (l *Logger) log(level, msg string, args ...interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	formattedMsg := fmt.Sprintf(msg, args...)
	logOutput := fmt.Sprintf("[%s] %s: %s", timestamp, level, formattedMsg)
	l.logger.Println(logOutput)
}

// parseLevel converts string to Level
func parseLevel(levelStr string) Level {
	switch strings.ToLower(levelStr) {
	case "debug":
		return DebugLevel
	case "info":
		return InfoLevel
	case "warn":
		return WarnLevel
	case "error":
		return ErrorLevel
	default:
		return InfoLevel
	}
}
