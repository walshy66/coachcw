import pino, { LoggerOptions } from 'pino';
import { config } from '../config';

export type LogContext = {
  correlationId?: string;
  reqId?: string;
};

const baseOptions: LoggerOptions = {
  level: config.logging.level,
  redact: {
    paths: ['req.headers.authorization', 'credentials', 'password', 'token'],
    remove: true
  }
};

const isDev = config.env === 'development';

const devTransport = isDev
  ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'SYS:standard',
        colorize: true,
        singleLine: false
      }
    }
  : undefined;

export const logger = pino({
  ...baseOptions,
  transport: devTransport
});

export function withLogContext(context: LogContext) {
  return logger.child({
    correlationId: context.correlationId,
    reqId: context.reqId
  });
}
