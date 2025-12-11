import 'dotenv/config';
import { z } from 'zod';

export type DatabaseConnectionProfileConfig = {
  environment: string;
  host: string;
  port: number;
  schema: string;
  credentialRef: string;
  rotationIntervalHours: number;
};

export type AppConfig = {
  env: 'development' | 'test' | 'production';
  server: {
    port: number;
    host: string;
  };
  logging: {
    level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';
  };
  database: {
    url: string;
    connectionProfile: DatabaseConnectionProfileConfig;
  };
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('0.0.0.0'),
  PORT: z
    .string()
    .default('3333')
    .transform((val) => Number(val)),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DB_ENVIRONMENT: z.string().default('development'),
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z
    .string()
    .default('5432')
    .transform((val) => Number(val)),
  DB_SCHEMA: z.string().default('public'),
  DB_CREDENTIAL_REF: z.string().default('local-dev'),
  DB_ROTATION_HOURS: z
    .string()
    .default('720')
    .transform((val) => Number(val))
});

let cachedConfig: AppConfig | null = null;

export function loadConfig(): AppConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const envResult = envSchema.safeParse(process.env);
  if (!envResult.success) {
    const formatted = envResult.error.flatten();
    throw new Error(`Invalid configuration: ${JSON.stringify(formatted.fieldErrors)}`);
  }

  const parsed = envResult.data;

  cachedConfig = {
    env: parsed.NODE_ENV,
    server: {
      host: parsed.HOST,
      port: parsed.PORT
    },
    logging: {
      level: parsed.LOG_LEVEL
    },
    database: {
      url: parsed.DATABASE_URL,
      connectionProfile: {
        environment: parsed.DB_ENVIRONMENT,
        host: parsed.DB_HOST,
        port: parsed.DB_PORT,
        schema: parsed.DB_SCHEMA,
        credentialRef: parsed.DB_CREDENTIAL_REF,
        rotationIntervalHours: parsed.DB_ROTATION_HOURS
      }
    }
  };

  return cachedConfig;
}

export const config = loadConfig();
