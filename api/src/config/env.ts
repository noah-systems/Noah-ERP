import { config } from 'dotenv';
import { z } from 'zod';

config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z
      .string()
      .optional()
      .transform((value) => {
        const parsed = Number.parseInt(value ?? '3000', 10);
        if (Number.isNaN(parsed) || parsed <= 0) {
          throw new Error('PORT must be a positive integer');
        }
        return parsed;
      }),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
    JWT_SECRET: z.string().min(16, 'JWT_SECRET must contain at least 16 characters').default('change-me-now'),
    JWT_EXPIRES_IN: z.string().default('12h'),
    CORS_ORIGINS: z.string().optional(),
  })
  .passthrough();

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;

export const allowedOrigins = env.CORS_ORIGINS
  ? env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : ['*'];
