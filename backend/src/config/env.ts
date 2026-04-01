import * as dotenv from 'dotenv';

dotenv.config();

const REQUIRED_VARS = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
] as const;

for (const varName of REQUIRED_VARS) {
  if (!process.env[varName]) {
    throw new Error(`필수 환경 변수가 누락되었습니다: ${varName}`);
  }
}

export const config = {
  server: {
    port: parseInt(process.env['PORT'] ?? '3000', 10),
    nodeEnv: process.env['NODE_ENV'] ?? 'development',
  },
  db: {
    host: process.env['DB_HOST'] as string,
    port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
    name: process.env['DB_NAME'] as string,
    user: process.env['DB_USER'] as string,
    password: process.env['DB_PASSWORD'] as string,
  },
  jwt: {
    secret: process.env['JWT_SECRET'] as string,
    expiresIn: process.env['JWT_EXPIRES_IN'] ?? '1h',
  },
  cors: {
    origin: process.env['CORS_ORIGIN'] ?? 'http://localhost:5173',
  },
} as const;
