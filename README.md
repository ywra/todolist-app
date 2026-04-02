# Todo App — 개인별 할일 관리 애플리케이션

## 개요
개인 인증 기반 할일 관리 웹 애플리케이션입니다.
내 할일 목록, 오늘의 할일(달력 포함), 보상 시스템을 독립적으로 관리할 수 있습니다.

## 주요 기능
- 회원가입 / 로그인 / 프로필 수정 / 비밀번호 변경
- 내 할일 목록 (CRUD, 필터/정렬/페이지네이션)
- 오늘의 할일 (독립 시스템, 달력 뷰, 날짜별 완료/미완료 표시)
- 보상 시스템 (10/30/100 마일스톤, 보드게임 말판 UI)
- Dark Mode / 다국어 (한국어/영어/일본어)

## 기술 스택
| 레이어 | 기술 |
|--------|------|
| 프론트엔드 | React 19 + TypeScript + Zustand + TanStack Query + Vite |
| 백엔드 | Node.js + Express 5 + TypeScript + pg (Raw SQL) |
| 데이터베이스 | PostgreSQL 17 |
| 인증 | JWT (Bearer Token) |
| 테스트 | Jest + Supertest (백엔드) / Vitest + React Testing Library (프론트엔드) |

## 프로젝트 구조
```
todolist-app/
├── frontend/       # React 프론트엔드
├── backend/        # Express 백엔드
├── database/       # DB 스키마 (schema.sql)
├── swagger/        # API 명세 (swagger.json)
├── docs/           # 설계 문서 9종
└── mockup/         # 목업 서버
```

## 시작하기

### 사전 요구사항
- Node.js 20+
- PostgreSQL 17+

### 데이터베이스 설정
```bash
# PostgreSQL에서 데이터베이스 생성 후 스키마 실행
psql -U postgres -f database/schema.sql
```

### 백엔드 실행
```bash
cd backend
cp .env.example .env    # 환경변수 설정
npm install
npm run dev             # http://localhost:3000
```

### 프론트엔드 실행
```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

### API 문서
서버 실행 후 http://localhost:3000/api-docs 에서 Swagger UI 확인

## 테스트
```bash
# 백엔드 (188 tests)
cd backend && npm test

# 프론트엔드 (197 tests)
cd frontend && npm test
```

## API 엔드포인트 (23개)

### 인증
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/auth/register | 회원가입 |
| POST | /api/auth/login | 로그인 |
| POST | /api/auth/logout | 로그아웃 |
| GET | /api/auth/profile | 프로필 조회 |
| PUT | /api/auth/profile | 프로필 수정 |
| PUT | /api/auth/profile/password | 비밀번호 변경 |

### 내 할일 목록
| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | /api/todos | 등록 |
| GET | /api/todos | 목록 조회 |
| GET | /api/todos/:id | 상세 조회 |
| PUT | /api/todos/:id | 수정 |
| PATCH | /api/todos/:id/complete | 완료 |
| PATCH | /api/todos/:id/incomplete | 완료 취소 |
| DELETE | /api/todos/:id | 삭제 |

### 오늘의 할일
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/daily-todos | 목록 조회 |
| POST | /api/daily-todos | 등록 |
| GET | /api/daily-todos/calendar | 달력 데이터 |
| PATCH | /api/daily-todos/:id/complete | 완료 |
| PATCH | /api/daily-todos/:id/incomplete | 완료 취소 |
| DELETE | /api/daily-todos/:id | 삭제 |

### 보상
| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | /api/rewards | 보상 현황 |
| POST | /api/rewards | 보상 설정 |
| PUT | /api/rewards/:id | 보상 수정 |

## 설계 문서
| 문서 | 파일 |
|------|------|
| 도메인 정의서 | docs/1-domain-definition.md |
| PRD | docs/2-prd.md |
| 사용자 시나리오 | docs/3-user-scenario.md |
| 프로젝트 구조 | docs/4-project-structure.md |
| 아키텍처 다이어그램 | docs/5-arch-diagram.md |
| ERD | docs/6-erd.md |
| 실행계획서 | docs/7-execution-plan.md |
| 와이어프레임 | docs/8-wireframes.md |
| 스타일 가이드 | docs/9-style-guide.md |

## 라이선스
ISC
