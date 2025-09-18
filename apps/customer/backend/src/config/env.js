import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().default('3002'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    FRONTEND_URL: z.string().default('http://localhost:3000'),
    BCRYPT_ROUNDS: z.string().default('12'),
    COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 characters'),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export default env;