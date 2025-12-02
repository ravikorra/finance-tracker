package logger

import (
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
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
	level      Level
	debug      bool
	logger     *log.Logger
	logFile    *os.File
	logDir     string
	currentDay string
}

// New creates a new logger with file output
func New(logLevel string, debug bool, logDir string) *Logger {
	level := parseLevel(logLevel)

	// Use default if not specified
	if logDir == "" {
		logDir = "logs"
	}

	// Create logs directory if it doesn't exist
	if err := os.MkdirAll(logDir, 0755); err != nil {
		log.Printf("Failed to create logs directory: %v", err)
	}

	logger := &Logger{
		level:  level,
		debug:  debug,
		logDir: logDir,
	}

	// Open initial log file
	logger.rotateLogFile()

	return logger
}

// rotateLogFile creates a new log file for the current day
func (l *Logger) rotateLogFile() {
	today := time.Now().Format("2006-01-02")

	// Close existing log file if open
	if l.logFile != nil {
		l.logFile.Close()
	}

	// Create new log file with date
	logFileName := filepath.Join(l.logDir, fmt.Sprintf("app-%s.log", today))
	logFile, err := os.OpenFile(logFileName, os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("Failed to open log file: %v, falling back to stdout", err)
		l.logger = log.New(os.Stdout, "", 0)
		return
	}

	l.logFile = logFile
	l.currentDay = today

	// Write to both stdout and file
	multiWriter := io.MultiWriter(os.Stdout, logFile)
	l.logger = log.New(multiWriter, "", 0)
}

// checkRotation checks if log file needs rotation (new day)
func (l *Logger) checkRotation() {
	today := time.Now().Format("2006-01-02")
	if today != l.currentDay {
		l.rotateLogFile()
	}
}

// Close closes the log file
func (l *Logger) Close() {
	if l.logFile != nil {
		l.logFile.Close()
	}
}

// Debug logs a debug message
func (l *Logger) Debug(msg string, args ...interface{}) {
	if l.level <= DebugLevel {
		l.checkRotation()
		l.log("DEBUG", msg, args...)
	}
}

// Info logs an info message
func (l *Logger) Info(msg string, args ...interface{}) {
	if l.level <= InfoLevel {
		l.checkRotation()
		l.log("INFO", msg, args...)
	}
}

// Warn logs a warning message
func (l *Logger) Warn(msg string, args ...interface{}) {
	if l.level <= WarnLevel {
		l.checkRotation()
		l.log("WARN", msg, args...)
	}
}

// Error logs an error message
func (l *Logger) Error(msg string, args ...interface{}) {
	if l.level <= ErrorLevel {
		l.checkRotation()
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
