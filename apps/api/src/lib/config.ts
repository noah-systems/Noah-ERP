import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z
    .string()
    .min(16, 'JWT_SECRET must be at least 16 characters long for security.')
    .catch(() => 'change-me'),
  CORS_ORIGINS: z.string().optional(),
  SESSION_TTL_HOURS: z.coerce.number().positive().default(12),
});

const parsed = envSchema.parse({
  PORT: process.env.PORT ?? '3000',
  JWT_SECRET: process.env.JWT_SECRET ?? '',
  CORS_ORIGINS: process.env.CORS_ORIGINS,
  SESSION_TTL_HOURS: process.env.SESSION_TTL_HOURS ?? '12',
});

const corsOrigins = parsed.CORS_ORIGINS
  ? parsed.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : [];

export const config = {
  port: parsed.PORT,
  jwtSecret: parsed.JWT_SECRET,
  corsOrigins,
  sessionTtlHours: parsed.SESSION_TTL_HOURS,
};
