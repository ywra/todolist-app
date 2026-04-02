/**
 * BE-01: Express 앱 기동 및 기본 라우트 통합 테스트
 *
 * env.ts는 모듈 로드 시점에 필수 환경 변수를 검증한다.
 * 테스트에서는 app.ts import 전에 process.env를 설정하여 검증을 통과시킨다.
 * DB 연결은 app.ts에서 require.main === module 조건으로 분리되어 있으므로
 * supertest는 실제 DB 없이도 앱을 테스트할 수 있다.
 */

// app.ts import 전에 필수 환경 변수를 설정해야 env.ts 검증을 통과한다
process.env['DB_HOST'] = process.env['DB_HOST'] ?? 'localhost';
process.env['DB_NAME'] = process.env['DB_NAME'] ?? 'todolist';
process.env['DB_USER'] = process.env['DB_USER'] ?? 'postgres';
process.env['DB_PASSWORD'] = process.env['DB_PASSWORD'] ?? 'postgres';
process.env['JWT_SECRET'] = process.env['JWT_SECRET'] ?? 'test-secret-key';
process.env['CORS_ORIGIN'] = process.env['CORS_ORIGIN'] ?? 'http://localhost:5173';

import request from 'supertest';
import { app } from '../../src/app';

describe('BE-01: Express 앱 기동 테스트', () => {
  describe('GET /api/health', () => {
    it('200 상태 코드와 성공 응답을 반환해야 한다', async () => {
      const res = await request(app).get('/api/health');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        success: true,
        data: { status: 'ok' },
      });
    });

    it('응답 Content-Type이 application/json이어야 한다', async () => {
      const res = await request(app).get('/api/health');

      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('존재하지 않는 경로', () => {
    it('GET /api/not-found는 404 상태 코드를 반환해야 한다', async () => {
      const res = await request(app).get('/api/not-found');

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '요청한 리소스를 찾을 수 없습니다.',
        },
      });
    });

    it('GET /unknown은 404 상태 코드를 반환해야 한다', async () => {
      const res = await request(app).get('/unknown');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
