/**
 * 테스트 전용 Pool 인스턴스
 *
 * env.ts는 모듈 로드 시 필수 환경 변수를 검증하며, JWT_SECRET 등이 없으면
 * 예외를 던진다. 테스트 환경에서는 해당 변수를 .env에서 읽어오거나
 * 기본값을 사용해 Pool을 직접 생성한다.
 *
 * pg 기본 동작에서 DATE 타입(OID 1082)은 UTC 자정의 Date 객체로 파싱된다.
 * 그러나 todo-repository.ts는 start_date/due_date를 string('YYYY-MM-DD')으로
 * 다루므로, 타입 파서를 설정해 DATE 컬럼을 문자열 그대로 반환하도록 한다.
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { Pool, types } from 'pg';

// backend/.env 로드
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// DATE 타입(OID 1082)을 문자열 'YYYY-MM-DD'로 반환하도록 파서 등록
// (기본값: UTC 자정 Date 객체)
types.setTypeParser(1082, (val: string) => val);

export const testPool = new Pool({
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  database: process.env['DB_NAME'] ?? 'todolist',
  user: process.env['DB_USER'] ?? 'postgres',
  password: process.env['DB_PASSWORD'] ?? 'postgres',
});

/**
 * todos → users 순서로 TRUNCATE (FK 제약 준수)
 */
export async function truncateTables(): Promise<void> {
  await testPool.query('TRUNCATE TABLE todos, users RESTART IDENTITY CASCADE');
}
