import { Pool } from 'pg';
import { config } from './env';

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
});

export async function testConnection(): Promise<void> {
  try {
    const result = await pool.query<{ now: Date }>('SELECT NOW()');
    console.log(`[DB] PostgreSQL 연결 성공: ${result.rows[0]?.now?.toISOString() ?? ''}`);
  } catch (error) {
    console.error('[DB] PostgreSQL 연결 실패:', error);
    throw error;
  }
}

process.on('SIGINT', async () => {
  console.log('[DB] SIGINT 수신 - 연결 풀 종료 중...');
  await pool.end();
  console.log('[DB] 연결 풀 종료 완료');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('[DB] SIGTERM 수신 - 연결 풀 종료 중...');
  await pool.end();
  console.log('[DB] 연결 풀 종료 완료');
  process.exit(0);
});
