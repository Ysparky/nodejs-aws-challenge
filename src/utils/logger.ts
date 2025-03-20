import * as winston from "winston";

const { format, createLogger, transports } = winston;

// Custom format for AWS Lambda environment
const awsFormat = format.combine(
  format.timestamp(),
  format.errors({ stack: true }),
  format.json()
);

// Base logger class
export class BaseLogger {
  private static instance: winston.Logger;
  private static loggers: Map<string, winston.Logger> = new Map();

  private static getInstance(): winston.Logger {
    if (!BaseLogger.instance) {
      BaseLogger.instance = createLogger({
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        format: awsFormat,
        defaultMeta: { service: "star-wars-weather-service" },
        transports: [
          new transports.Console({
            format: format.combine(format.colorize(), format.simple()),
          }),
        ],
      });
    }
    return BaseLogger.instance;
  }

  public static logger(name: string): winston.Logger {
    if (!BaseLogger.loggers.has(name)) {
      const logger = BaseLogger.getInstance().child({ logger: name });
      BaseLogger.loggers.set(name, logger);
    }
    return BaseLogger.loggers.get(name)!;
  }
}

// Export a default logger for backward compatibility
export default BaseLogger.logger("default");
