// 简单的可观测性封装，后续可以接入更完整的日志/监控平台。

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function log(level: LogLevel, message: string, context?: LogContext) {
  const payload = {
    level,
    message,
    context,
    timestamp: new Date().toISOString()
  };

  // 目前先输出到 console，未来可以接入外部日志服务。
  if (level === "error") {
    console.error(payload);
  } else if (level === "warn") {
    console.warn(payload);
  } else {
    console.log(payload);
  }
}

export const logger = {
  debug: (message: string, context?: LogContext) =>
    log("debug", message, context),
  info: (message: string, context?: LogContext) => log("info", message, context),
  warn: (message: string, context?: LogContext) => log("warn", message, context),
  error: (message: string, context?: LogContext) =>
    log("error", message, context)
};


