import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { testConnection } from './config/db';
import { AppError, ERROR_CODES } from './utils/error-utils';
import { router } from './routes';
import swaggerDocument from '../../swagger/swagger.json';

const app = express();

// 미들웨어
app.use(express.json());
app.use(
  cors({
    origin: config.cors.origin,
    credentials: true,
  })
);

// Swagger UI (CDN 방식 — Vercel Serverless 호환)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.17.14/swagger-ui-standalone-preset.js',
  ],
}));

// Swagger JSON 직접 제공
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.json(swaggerDocument);
});

// 기본 헬스체크 라우트
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

// 라우트
app.use(router);

// 404 핸들러
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: ERROR_CODES.NOT_FOUND,
      message: '요청한 리소스를 찾을 수 없습니다.',
    },
  });
});

// 전역 에러 핸들러
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
      },
    });
  }

  return res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: '서버 내부 오류가 발생했습니다.',
    },
  });
});

export { app };

// 직접 실행 시에만 서버 시작
if (require.main === module) {
  const PORT = config.server.port;

  testConnection()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[SERVER] 서버 시작 완료 - http://localhost:${PORT}`);
        console.log(`[SERVER] 환경: ${config.server.nodeEnv}`);
      });
    })
    .catch((error: unknown) => {
      console.error('[SERVER] DB 연결 실패로 서버를 시작할 수 없습니다:', error);
      process.exit(1);
    });
}
