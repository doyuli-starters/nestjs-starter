import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = this.configService.get<string>(
      'app.nodeEnv',
      'development',
    );
    const isProduction = nodeEnv === 'production';
    const logLevel = this.configService.get<string>('app.logLevel', 'info');

    const devFormat = winston.format.printf(
      ({ timestamp, level, message, context, stack, ...meta }) => {
        const ctx = context ? `[${context}] ` : '';
        const extra = Object.keys(meta).length
          ? ` ${JSON.stringify(meta)}`
          : '';
        const stk = stack ? `\n${stack}` : '';
        return `${timestamp} ${level}: ${ctx}${message}${extra}${stk}`;
      },
    );

    const format = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      isProduction ? winston.format.json() : devFormat,
    );

    const transports: winston.transport[] = [
      new winston.transports.Console(),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        maxsize: 5242880, // 5MB
        maxFiles: 5,
      }),
    ];

    this.logger = winston.createLogger({
      level: logLevel,
      format,
      transports,
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, stack?: string, context?: string) {
    this.logger.error(message, { stack, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  logWithContext(level: string, message: string, meta?: Record<string, any>) {
    this.logger.log(level, message, meta);
  }
}
