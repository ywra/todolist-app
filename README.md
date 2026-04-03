# Todo App — 개인별 할일 관리 애플리케이션

## 개요

개인 인증 기반 할일 관리 웹 애플리케이션입니다.
내 할일 목록, 오늘의 할일(달력 포함), 보상 시스템을 독립적으로 관리할 수 있습니다.

## 주요 기능

- **회원가입 / 로그인** — JWT 인증, 비밀번호 재확인, 세션 영속화 (localStorage)
- **프로필 관리** — 이름 수정, 비밀번호 변경
- **내 할일 목록** — CRUD, 상태 필터(5종+종료된 할일), 정렬(시작일/종료일/생성일), 페이지네이션(20건)
- **오늘의 할일** — 내 할일과 **완전 독립**, 달력 뷰(월별 완료/미완료 마커), 날짜별 목록
- **보상 시스템** — 10/30/100 마일스톤, 보드게임 말판 UI, 사용자 보상 설정, 자동 달성 (오늘의 할일 기준)
- **Dark Mode** — 🌙/☀️ 토글, localStorage 저장, 시스템 설정 감지
- **다국어** — 한국어/영어/일본어 (자체 경량 i18n, KO/EN/JA 전환)

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | React 19 + TypeScript + Zustand + TanStack Query + Vite |
| 백엔드 | Node.js + Express 5 + TypeScript + pg (Raw SQL, ORM 미사용) |
| 데이터베이스 | PostgreSQL 17 (로컬) + Supabase (클라우드) |
| 인증 | JWT (Bearer Token, 1시간 만료) |
| 배포 | Vercel (Serverless) + GitHub Actions CI/CD |
| 테스트 | Jest + Supertest (BE 188건) / Vitest + RTL (FE 197건) / Playwright (E2E 17건) |

## 프로젝트 구조

```
todolist-app/
├── frontend/          # React 프론트엔드
│   ├── src/
│   │   ├── api/           # Axios API 클라이언트
│   │   ├── components/    # UI 컴포넌트 (common, auth, todo, layout)
│   │   ├── hooks/         # TanStack Query 커스텀 훅
│   │   ├── pages/         # 페이지 (Login, Register, TodoList, TodoDetail, Daily, Reward, Profile)
│   │   ├── stores/        # Zustand 스토어 (auth, theme, locale)
│   │   ├── i18n/          # 다국어 번역 (ko, en, ja)
│   │   ├── types/         # TypeScript 타입
│   │   └── utils/         # 유틸리티 (date, validation)
│   └── vercel.json
├── backend/           # Express 백엔드
│   ├── src/
│   │   ├── config/        # 환경 변수, DB Pool
│   │   ├── controllers/   # HTTP 핸들러
│   │   ├── services/      # 비즈니스 로직
│   │   ├── repositories/  # Raw SQL 데이터 접근
│   │   ├── middlewares/   # JWT 인증
│   │   ├── routes/        # 라우트 정의
│   │   ├── types/         # TypeScript 타입
│   │   └── utils/         # bcrypt, JWT, 에러 유틸
│   ├── api/index.ts       # Vercel Serverless 엔트리포인트
│   └── vercel.json
├── database/          # DB 스키마 (schema.sql)
├── swagger/           # API 명세 (swagger.json)
├── docs/              # 설계 문서 9종
├── test/e2e/          # E2E 테스트 결과 (스크린샷 + 보고서)
└── .github/workflows/ # CI/CD
```

## 데이터베이스 스키마 (4개 테이블)

| 테이블 | 설명 | 관계 |
|--------|------|------|
| `users` | 사용자 (email, password, name) | - |
| `todos` | 내 할일 목록 (title, start_date, due_date, is_completed) | users 1:N |
| `daily_todos` | 오늘의 할일 (todos와 **독립**) | users 1:N |
| `rewards` | 보상 (milestone 10/30/100, 사용자별 UNIQUE) | users 1:N |

## 시작하기

### 사전 요구사항
- Node.js 20+
- PostgreSQL 17+

### 데이터베이스 설정
```bash
psql -U postgres -f database/schema.sql
```

### 백엔드 실행
```bash
cd backend
cp .env.example .env    # 환경변수 설정 (DB_HOST, JWT_SECRET 등)
npm install
npm run dev             # http://localhost:3000
```

### 프론트엔드 실행
```bash
cd frontend
cp .env.example .env    # VITE_API_BASE_URL=http://localhost:3000/api
npm install
npm run dev             # http://localhost:5173
```

### API 문서
서버 실행 후 http://localhost:3000/api-docs 에서 Swagger UI 확인

## 테스트

```bash
# 백엔드 단위 + 통합 테스트 (188건)
cd backend && npm test

# 프론트엔드 단위 테스트 (197건)
cd frontend && npm test
```

## API 엔드포인트 (24개)

### 인증 & 프로필 (6개)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/auth/register | 회원가입 (비밀번호 재확인) |
| POST | /api/auth/login | 로그인 → JWT 발급 |
| POST | /api/auth/logout | 로그아웃 |
| GET | /api/auth/profile | 프로필 조회 |
| PUT | /api/auth/profile | 이름 수정 |
| PUT | /api/auth/profile/password | 비밀번호 변경 |

### 내 할일 목록 (7개)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/todos | 등록 |
| GET | /api/todos | 목록 조회 (필터/정렬/페이지네이션) |
| GET | /api/todos/:id | 상세 조회 |
| PUT | /api/todos/:id | 수정 |
| PATCH | /api/todos/:id/complete | 완료 처리 |
| PATCH | /api/todos/:id/incomplete | 완료 취소 |
| DELETE | /api/todos/:id | 삭제 (204) |

### 오늘의 할일 (6개) — 내 할일과 독립
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/daily-todos | 오늘 날짜 범위 목록 |
| POST | /api/daily-todos | 등록 (시작일/종료일 기본=오늘) |
| GET | /api/daily-todos/calendar | 월별 달력 데이터 |
| PATCH | /api/daily-todos/:id/complete | 완료 → 보상 카운트 증가 |
| PATCH | /api/daily-todos/:id/incomplete | 완료 취소 |
| DELETE | /api/daily-todos/:id | 삭제 |

### 보상 (3개)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/rewards | 보상 현황 (completedCount, 말판 진행) |
| POST | /api/rewards | 보상 설정 (milestone: 10/30/100) |
| PUT | /api/rewards/:id | 보상 수정 |

### 기타 (2개)
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/health | 헬스체크 |
| GET | /api-docs | Swagger UI |

## 배포

### Vercel 배포 구성

| 프로젝트 | Root Directory | 환경 변수 |
|---------|---------------|-----------|
| 백엔드 | `backend` | DB_HOST, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, CORS_ORIGIN |
| 프론트엔드 | `frontend` | VITE_API_BASE_URL |

### Supabase (클라우드 DB)
- 프로젝트: `rhvigpvkatsftspimvgc` (ap-northeast-2, PostgreSQL 17.6)
- 4개 테이블 마이그레이션 완료

## 설계 문서

| 문서 | 파일 | 버전 |
|------|------|------|
| 도메인 정의서 | docs/1-domain-definition.md | v1.2.0 |
| PRD | docs/2-prd.md | v1.2.0 |
| 사용자 시나리오 | docs/3-user-scenario.md | v1.1.0 |
| 프로젝트 구조 | docs/4-project-structure.md | v1.2.0 |
| 아키텍처 다이어그램 | docs/5-arch-diagram.md | v1.2.0 |
| ERD | docs/6-erd.md | v1.1.0 |
| 실행계획서 | docs/7-execution-plan.md | v1.1.0 |
| 와이어프레임 | docs/8-wireframes.md | v1.0.0 |
| 스타일 가이드 | docs/9-style-guide.md | v1.0.0 |
| Swagger API 명세 | swagger/swagger.json | v1.2.0 |

## 라이선스
ISC
