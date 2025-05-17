type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private readonly maxLogs = 1000

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private formatMessage(level: LogLevel, message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // در محیط توسعه، لاگ‌ها را در کنسول نمایش می‌دهیم
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 
                           entry.level === 'debug' ? 'debug' : 'log'
      
      console[consoleMethod](
        `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
        entry.data || ''
      )
    }
  }

  info(message: string, data?: any) {
    this.addLog(this.formatMessage('info', message, data))
  }

  warn(message: string, data?: any) {
    this.addLog(this.formatMessage('warn', message, data))
  }

  error(message: string, data?: any) {
    this.addLog(this.formatMessage('error', message, data))
  }

  debug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.addLog(this.formatMessage('debug', message, data))
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs]
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = Logger.getInstance() 