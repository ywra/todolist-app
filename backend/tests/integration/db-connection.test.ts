import { Pool } from 'pg';

// env.ts의 필수 환경 변수 검증을 우회하기 위해 직접 Pool 생성
const pool = new Pool({
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  database: process.env['DB_NAME'] ?? 'todolist',
  user: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? 'postgres',
});

describe('DB-07: 데이터베이스 연결 통합 테스트', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('Pool 연결 성공 - SELECT NOW() 실행', async () => {
    const result = await pool.query<{ now: Date }>('SELECT NOW()');

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toBeDefined();
    expect(result.rows[0]!.now).toBeInstanceOf(Date);
  });

  it('연결 풀에서 클라이언트를 획득하고 반환할 수 있다', async () => {
    const client = await pool.connect();
    try {
      const result = await client.query<{ now: Date }>('SELECT NOW()');
      expect(result.rows[0]!.now).toBeInstanceOf(Date);
    } finally {
      client.release();
    }
  });
});
