# 프로젝트 구조 설계 원칙

## 변경 이력

| 버전 | 변경일 | 변경 내용 | 작성자 |
|------|--------|-----------|--------|
| v1.0.0 | 2026-04-01 | 최초 작성 | - |
| v1.1.0 | 2026-04-02 | 오늘의 할일 및 보상 시스템 엔드포인트, 디렉토리 구조, 프로필 관련 API 추가 | - |

---

## 1. 최상위 공통 원칙

### 1.1 모노레포 구조

프론트엔드와 백엔드를 하나의 저장소에서 관리하되, 디렉토리를 완전히 분리한다.

```
todolist-app/
├── frontend/          # React 19 + TypeScript 프론트엔드
├── backend/           # Node.js + Express 백엔드
├── docs/              # 프로젝트 문서
├── .gitignore
└── README.md
```

- `frontend/`와 `backend/`는 각각 독립적인 `package.json`을 가진다.
- 두 프로젝트 간 코드를 직접 import하지 않는다.

### 1.2 3-Tier 아키텍처 원칙

| 티어 | 기술 | 역할 |
|------|------|------|
| 프레젠테이션 | React 19 + TypeScript + Zustand + TanStack Query | 사용자 인터페이스, 클라이언트 상태 관리 |
| 애플리케이션 | Node.js + Express + JWT | 비즈니스 로직 처리, 인증, API 제공 |
| 데이터 | PostgreSQL + pg 라이브러리 (Raw SQL) | 데이터 영속화 |

### 1.3 프론트엔드-백엔드 간 계약 기반 통신

- 프론트엔드와 백엔드는 RESTful API를 통해서만 통신한다.
- 모든 API 요청/응답은 JSON 형식을 사용한다.
- 인증이 필요한 API는 `Authorization: Bearer <token>` 헤더를 포함한다.
- API 응답은 아래 표준 형식을 따른다.

**성공 응답:**
```json
{
  "success": true,
  "data": { ... }
}
```

**목록 응답 (페이지네이션 포함):**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "size": 20,
    "totalCount": 100,
    "totalPages": 5
  }
}
```

**에러 응답:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "종료일은 시작일 이후여야 합니다."
  }
}
```

### 1.4 환경별 설정 분리

| 환경 | 설정 파일 | 용도 |
|------|-----------|------|
| 개발 | `.env.development` | 로컬 개발 환경 |
| 운영 | `.env.production` | 운영 배포 환경 |
| 공통 | `.env.example` | 환경 변수 템플릿 (Git 추적 대상) |

- `.env` 파일은 `.gitignore`에 포함하여 Git에 커밋하지 않는다.
- `.env.example` 파일에 필요한 환경 변수 키와 설명을 기록한다.

---

## 2. 의존성/레이어 원칙

### 2.1 백엔드 레이어 구조

의존 방향은 항상 단방향이다: **Route → Controller → Service → Repository**

```
Route (라우팅)
  ↓
Controller (요청/응답 처리)
  ↓
Service (비즈니스 로직)
  ↓
Repository (데이터 접근)
  ↓
PostgreSQL
```

| 레이어 | 역할 | 허용되는 의존 | 금지 사항 |
|--------|------|---------------|-----------|
| Route | URL 경로와 HTTP 메서드 매핑, 미들웨어 적용 | Controller | 비즈니스 로직 포함 금지 |
| Controller | 요청 파라미터 파싱, 응답 형식 구성 | Service | DB 직접 접근 금지, 비즈니스 로직 포함 금지 |
| Service | 비즈니스 로직 수행, 입력값 유효성 검증, 트랜잭션 관리 | Repository | HTTP 요청/응답 객체 접근 금지 |
| Repository | SQL 쿼리 작성 및 실행, 데이터 매핑 | pg Pool | 비즈니스 로직 포함 금지 |

### 2.2 프론트엔드 레이어 구조

```
Page (페이지 컴포넌트)
  ↓
Component (UI 컴포넌트)
  ↓
hooks / api (데이터 페칭, 커스텀 훅)
  ↓
stores (Zustand 전역 상태)
```

| 레이어 | 역할 | 허용되는 의존 |
|--------|------|---------------|
| Page | 라우트에 매핑되는 페이지 단위 컴포넌트, 레이아웃 구성 | Component, hooks, stores |
| Component | 재사용 가능한 UI 컴포넌트 | hooks, stores, 하위 Component |
| hooks | TanStack Query 기반 서버 상태 관리, 커스텀 로직 | api, stores |
| api | HTTP 요청 함수 정의 | 외부 의존 없음 |
| stores | Zustand 전역 상태 (인증 토큰, UI 상태) | 외부 의존 없음 |

### 2.3 순환 의존 금지

- 모든 레이어 간 의존은 상위에서 하위로의 단방향만 허용한다.
- 하위 레이어가 상위 레이어를 import하는 것을 금지한다.
- 같은 레이어 내 모듈 간 순환 참조를 금지한다.

---

## 3. 코드/네이밍 원칙

### 3.1 파일 및 폴더 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 폴더명 | kebab-case | `todo-list/`, `auth/` |
| React 컴포넌트 파일 | PascalCase.tsx | `TodoItem.tsx`, `LoginForm.tsx` |
| 훅 파일 | camelCase.ts (use 접두사) | `useTodos.ts`, `useAuth.ts` |
| API 함수 파일 | kebab-case.ts | `todo-api.ts`, `auth-api.ts` |
| 스토어 파일 | kebab-case.ts | `auth-store.ts` |
| 백엔드 모듈 파일 | kebab-case.ts | `todo-controller.ts`, `user-repository.ts` |
| 타입 정의 파일 | kebab-case.ts | `todo-types.ts`, `api-types.ts` |
| 설정 파일 | kebab-case.ts | `db-config.ts`, `jwt-config.ts` |

### 3.2 변수 및 함수 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 변수 | camelCase | `todoList`, `currentPage`, `isCompleted` |
| 함수 | camelCase (동사 시작) | `getTodos()`, `createTodo()`, `validateEmail()` |
| 상수 | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE`, `TOKEN_EXPIRY` |
| React 컴포넌트 | PascalCase | `TodoItem`, `LoginPage` |
| 인터페이스/타입 | PascalCase | `Todo`, `CreateTodoRequest`, `PaginationResponse` |

### 3.3 DB 컬럼 네이밍

| 대상 | 규칙 | 예시 |
|------|------|------|
| 테이블명 | snake_case (복수형) | `users`, `todos` |
| 컬럼명 | snake_case | `user_id`, `start_date`, `is_completed`, `created_at` |
| 기본키 | `id` | `id` (UUID) |
| 외래키 | `참조테이블_단수_id` | `user_id` |

### 3.4 API 엔드포인트 네이밍

RESTful 규칙을 따르며, 리소스는 복수형 명사를 사용한다.

| 메서드 | 엔드포인트 | 설명 | 관련 UC |
|--------|-----------|------|---------|
| POST | `/api/auth/register` | 회원 가입 | UC-01 |
| POST | `/api/auth/login` | 로그인 | UC-02 |
| POST | `/api/auth/logout` | 로그아웃 | UC-03 |
| GET | `/api/auth/profile` | 프로필 조회 | - |
| PUT | `/api/auth/profile` | 프로필 수정 | - |
| PUT | `/api/auth/profile/password` | 비밀번호 변경 | - |
| POST | `/api/todos` | 할일 등록 | UC-04 |
| GET | `/api/todos` | 할일 목록 조회 | UC-05 |
| GET | `/api/todos/:id` | 할일 상세 조회 | UC-06 |
| PUT | `/api/todos/:id` | 할일 수정 | UC-07 |
| PATCH | `/api/todos/:id/complete` | 할일 완료 처리 | UC-08 |
| DELETE | `/api/todos/:id` | 할일 삭제 | UC-09 |
| PATCH | `/api/todos/:id/incomplete` | 할일 완료 취소 | UC-10 |
| GET | `/api/daily-todos` | 오늘의 할일 목록 조회 | - |
| POST | `/api/daily-todos` | 오늘의 할일 등록 | - |
| PATCH | `/api/daily-todos/:id/complete` | 오늘의 할일 완료 | - |
| PATCH | `/api/daily-todos/:id/incomplete` | 오늘의 할일 미완료 | - |
| DELETE | `/api/daily-todos/:id` | 오늘의 할일 삭제 | - |
| GET | `/api/rewards` | 보상 현황 조회 | - |
| POST | `/api/rewards` | 보상 설정 | - |
| PUT | `/api/rewards/:id` | 보상 수정 | - |

---

## 4. 테스트/품질 원칙

### 4.1 테스트 전략

MVP 특성상 전체 커버리지보다 핵심 비즈니스 로직 위주로 테스트한다.

| 테스트 유형 | 대상 | 도구 | 우선순위 |
|-------------|------|------|----------|
| 단위 테스트 | 백엔드 Service 레이어 (BR-01~BR-09) | Jest | P1 |
| 통합 테스트 | 백엔드 API 엔드포인트 (인증, CRUD) | Jest + Supertest | P1 |
| 프론트엔드 테스트 | 핵심 컴포넌트 렌더링, 폼 유효성 검증 | Vitest + React Testing Library | P2 |

### 4.2 린트 및 포매팅

| 도구 | 용도 | 설정 |
|------|------|------|
| ESLint | 코드 린팅 | TypeScript 권장 규칙 적용 |
| Prettier | 코드 포매팅 | 세미콜론 사용, 작은따옴표, 탭 너비 2 |

---

## 5. 설정/보안/운영 원칙

### 5.1 환경 변수 관리

#### 백엔드 환경 변수

| 변수명 | 설명 | 필수 | 기본값 | 예시 |
|--------|------|------|--------|------|
| `PORT` | 서버 포트 번호 | N | `3000` | `3000` |
| `NODE_ENV` | 실행 환경 | N | `development` | `development`, `production` |
| `DB_HOST` | PostgreSQL 호스트 | Y | - | `localhost` |
| `DB_PORT` | PostgreSQL 포트 | N | `5432` | `5432` |
| `DB_NAME` | 데이터베이스 이름 | Y | - | `todolist` |
| `DB_USER` | 데이터베이스 접속 계정 | Y | - | `postgres` |
| `DB_PASSWORD` | 데이터베이스 접속 비밀번호 | Y | - | `password` |
| `JWT_SECRET` | JWT 서명용 시크릿 키 | Y | - | `my-secret-key-change-in-production` |
| `JWT_EXPIRES_IN` | Access Token 만료 시간 | N | `1h` | `1h`, `30m` |
| `CORS_ORIGIN` | 허용할 프론트엔드 Origin | Y | - | `http://localhost:5173` |

#### 프론트엔드 환경 변수

| 변수명 | 설명 | 필수 | 기본값 | 예시 |
|--------|------|------|--------|------|
| `VITE_API_BASE_URL` | 백엔드 API 기본 URL | Y | - | `http://localhost:3000/api` |

#### `.env.example` 템플릿

**백엔드:**
```
# 서버
PORT=3000
NODE_ENV=development

# 데이터베이스
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todolist
DB_USER=postgres
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=1h

# CORS
CORS_ORIGIN=http://localhost:5173
```

**프론트엔드:**
```
VITE_API_BASE_URL=http://localhost:3000/api
```

### 5.2 민감 정보 관리

| 항목 | 관리 방법 |
|------|-----------|
| JWT 시크릿 | `.env` 파일에 저장, Git 추적 제외 |
| DB 접속 정보 | `.env` 파일에 저장, Git 추적 제외 |
| 비밀번호 | bcrypt 단방향 해시 후 DB 저장 (평문 저장 금지) |
| `.env` 파일 | `.gitignore`에 반드시 포함 |

### 5.3 CORS 설정

- 백엔드에서 `cors` 미들웨어를 사용하여 허용 Origin을 환경 변수로 관리한다.
- 개발 환경: `http://localhost:5173` (Vite 기본 포트)
- 운영 환경: 배포 도메인만 허용

### 5.4 에러 응답 표준화

모든 에러 응답은 아래 형식을 따른다.

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "사용자에게 표시할 메시지"
  }
}
```

| HTTP 상태 코드 | 에러 코드 | 사용 상황 |
|----------------|-----------|-----------|
| 400 | VALIDATION_ERROR | 입력값 유효성 검증 실패 |
| 401 | UNAUTHORIZED | 인증 토큰 없음 또는 만료 |
| 403 | FORBIDDEN | 타인 데이터 접근 시도 |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 409 | DUPLICATE_EMAIL | 이메일 중복 (회원 가입 시) |
| 500 | INTERNAL_ERROR | 서버 내부 오류 |

### 5.5 로깅

- 별도 로깅 라이브러리를 사용하지 않고 `console` 기반 로깅을 사용한다.
- 로그 수준별 메서드를 구분하여 사용한다.

| 수준 | 메서드 | 용도 |
|------|--------|------|
| INFO | `console.log` | 서버 시작, 요청 처리 등 일반 정보 |
| WARN | `console.warn` | 토큰 만료, 유효성 검증 실패 등 경고 |
| ERROR | `console.error` | DB 연결 실패, 예외 발생 등 오류 |

- 프론트엔드는 개발 환경에서만 `console.log`를 허용하고, 운영 빌드에서는 제거한다.

---

## 6. 프론트엔드 디렉토리 구조

```
frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    # API 통신 함수
│   │   ├── auth-api.ts
│   │   ├── todo-api.ts
│   │   ├── daily-todo-api.ts
│   │   ├── reward-api.ts
│   │   └── client.ts           # Axios 인스턴스 설정
│   ├── components/             # 재사용 가능한 UI 컴포넌트
│   │   ├── common/             # 공통 (Button, Input, Modal 등)
│   │   ├── auth/               # 인증 관련
│   │   ├── todo/               # 할일 관련
│   │   │   └── DailyTodoItem.tsx
│   │   └── layout/             # 레이아웃 (Header, Footer 등)
│   ├── hooks/                  # 커스텀 훅
│   │   ├── useAuth.ts          # 인증 TanStack Query 훅
│   │   ├── useTodos.ts         # 할일 TanStack Query 훅
│   │   ├── useDailyTodos.ts    # 오늘의 할일 TanStack Query 훅
│   │   └── useRewards.ts       # 보상 TanStack Query 훅
│   ├── pages/                  # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── TodoListPage.tsx
│   │   ├── TodoDetailPage.tsx
│   │   ├── DailyTodoPage.tsx
│   │   ├── RewardPage.tsx
│   │   └── ProfilePage.tsx
│   ├── stores/                 # Zustand 전역 상태 스토어
│   │   ├── auth-store.ts       # 인증 상태 (토큰, 사용자 정보)
│   │   ├── theme-store.ts      # 테마 상태 (Dark Mode)
│   │   └── locale-store.ts     # 언어 설정 (i18n)
│   ├── types/                  # TypeScript 타입 정의
│   │   ├── auth-types.ts
│   │   ├── todo-types.ts
│   │   ├── daily-todo-types.ts
│   │   ├── reward-types.ts
│   │   └── api-types.ts        # 공통 API 응답 타입
│   ├── utils/                  # 유틸리티 함수
│   │   ├── date-utils.ts       # 날짜 포매팅, 상태 산출
│   │   └── validation-utils.ts # 클라이언트 유효성 검증
│   ├── i18n/                   # 국제화 (한국어/영어/일본어)
│   │   ├── ko.json
│   │   ├── en.json
│   │   └── ja.json
│   ├── App.tsx                 # 앱 루트, 라우터 설정
│   ├── main.tsx                # 엔트리 포인트
│   └── index.css               # 글로벌 스타일
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 프론트엔드 디렉토리 역할

| 디렉토리 | 역할 |
|----------|------|
| `api/` | Axios 인스턴스 설정 및 도메인별 API 호출 함수. `client.ts`에서 baseURL, 인증 헤더 인터셉터 설정 |
| `components/` | 재사용 UI 컴포넌트. 도메인별(`auth/`, `todo/`), 공통(`common/`), 레이아웃(`layout/`)으로 분류 |
| `hooks/` | TanStack Query의 `useQuery`, `useMutation`을 래핑한 커스텀 훅. 서버 상태 페칭/캐싱 캡슐화 |
| `pages/` | 라우트에 1:1 매핑되는 페이지 컴포넌트. 레이아웃 구성과 하위 컴포넌트 조합 담당 |
| `stores/` | Zustand 스토어. 인증 토큰 등 클라이언트 전역 상태만 관리 (서버 상태는 TanStack Query) |
| `types/` | TypeScript 인터페이스/타입. 도메인 모델(`Todo`, `User`)과 API 요청/응답 타입 정의 |
| `utils/` | 날짜 포매팅, 할일 상태 산출, 유효성 검증 등 순수 유틸리티 함수 |

---

## 7. 백엔드 디렉토리 구조

```
backend/
├── src/
│   ├── config/                 # 환경 설정
│   │   ├── db.ts               # PostgreSQL 연결 풀 (pg Pool) 설정
│   │   └── env.ts              # 환경 변수 로드 및 검증
│   ├── controllers/            # 요청/응답 처리
│   │   ├── auth-controller.ts
│   │   ├── todo-controller.ts
│   │   ├── daily-todo-controller.ts
│   │   └── reward-controller.ts
│   ├── middlewares/            # Express 미들웨어
│   │   └── auth-middleware.ts  # JWT 검증
│   ├── repositories/           # 데이터 접근 (Raw SQL)
│   │   ├── user-repository.ts
│   │   ├── todo-repository.ts
│   │   ├── daily-todo-repository.ts
│   │   └── reward-repository.ts
│   ├── routes/                 # 라우트 정의
│   │   ├── auth-routes.ts
│   │   ├── todo-routes.ts
│   │   ├── daily-todo-routes.ts
│   │   ├── reward-routes.ts
│   │   └── index.ts            # 라우트 통합
│   ├── services/               # 비즈니스 로직
│   │   ├── auth-service.ts
│   │   ├── todo-service.ts
│   │   ├── daily-todo-service.ts
│   │   └── reward-service.ts
│   ├── types/                  # TypeScript 타입 정의
│   │   ├── auth-types.ts
│   │   ├── todo-types.ts
│   │   ├── daily-todo-types.ts
│   │   ├── reward-types.ts
│   │   └── express.d.ts        # Express Request 타입 확장 (req.user)
│   ├── utils/                  # 유틸리티 함수
│   │   ├── password-utils.ts   # bcrypt 해싱
│   │   ├── jwt-utils.ts        # JWT 생성/검증
│   │   └── error-utils.ts      # 커스텀 에러 클래스
│   └── app.ts                  # Express 앱 초기화
├── tests/                      # 테스트
│   ├── unit/
│   └── integration/
├── .env.example
├── package.json
└── tsconfig.json
```

### 백엔드 디렉토리 역할

| 디렉토리 | 역할 |
|----------|------|
| `config/` | 환경 변수 로드(`env.ts`)와 PostgreSQL 연결 풀 설정(`db.ts`). `pg.Pool` 인스턴스를 생성하여 Repository에 제공 |
| `controllers/` | HTTP 요청 파싱, Service 호출, 표준 응답 형식 변환. `req`, `res` 객체를 직접 다루는 유일한 레이어 |
| `middlewares/` | JWT 인증 검증 등 횡단 관심사 처리. 전역 에러 핸들러는 `app.ts`에 인라인 구현 |
| `repositories/` | pg 라이브러리를 사용한 Raw SQL 실행. 도메인별 CRUD 쿼리 캡슐화. SQL 외 로직 포함 금지 |
| `routes/` | Express Router로 URL-HTTP 메서드를 Controller에 매핑. 인증 미들웨어 적용 여부를 이 레이어에서 결정 |
| `services/` | 비즈니스 규칙(BR-01~BR-09) 구현. 소유권 검증, 날짜 유효성, 상태 산출 등 핵심 로직 담당 |
| `types/` | TypeScript 인터페이스/타입. Express Request 확장(`req.user`), 도메인 DTO 정의 |
| `utils/` | bcrypt 해싱, JWT 생성/검증, 커스텀 에러 클래스 등 레이어 공통 유틸리티 |

---

## 8. 참조 문서

| 문서명 | 경로 | 버전 |
|--------|------|------|
| 도메인 정의서 | [./1-domain-definition.md](./1-domain-definition.md) | v1.1.0 |
| PRD | [./2-prd.md](./2-prd.md) | v1.1.0 |
| 사용자 시나리오 | [./3-user-scenario.md](./3-user-scenario.md) | v1.0.0 |
| ERD | [./6-erd.md](./6-erd.md) | v1.1.0 |
