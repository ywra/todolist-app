# 실행계획서

## 변경 이력

| 버전 | 변경일 | 변경 내용 | 작성자 |
|------|--------|-----------|--------|
| v1.0.0 | 2026-04-01 | 최초 작성 | - |

---

## 1. 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | todolist-app |
| 목표 출시일 | 2026-04-03 (3일) |
| 작업 영역 | 데이터베이스 (DB), 백엔드 (BE), 프론트엔드 (FE) |
| 총 Task 수 | DB 7개 + BE 15개 + FE 14개 = 36개 |

---

## 2. 데이터베이스 (DB)

### DB-01. PostgreSQL 데이터베이스 및 스키마 생성

| 항목 | 내용 |
|------|------|
| 상세 | `database/schema.sql` 실행하여 DB, 테이블, 인덱스 생성 |
| 의존성 | 없음 |
| 예상 소요 | 15분 |

**완료 조건:**
- [x] `todolist` 데이터베이스가 PostgreSQL에 생성됨
- [x] `pgcrypto` 확장이 활성화됨
- [x] `users` 테이블 5개 컬럼(id, email, password, name, created_at) 생성
- [x] `todos` 테이블 9개 컬럼 생성
- [x] `users.email` UNIQUE 제약 적용
- [x] `todos.due_date >= start_date` CHECK 제약 적용
- [x] `todos.user_id` FK(ON DELETE CASCADE) 적용
- [x] `idx_todos_user_id` 인덱스 생성

---

### DB-02. 백엔드 환경 변수 및 `.env.example` 작성

| 항목 | 내용 |
|------|------|
| 상세 | `.env.example`, `src/config/env.ts` 작성, 필수 변수 누락 시 에러 처리 |
| 의존성 | 없음 |
| 예상 소요 | 20분 |

**완료 조건:**
- [x] `backend/.env.example`에 DB/JWT/CORS 환경 변수 정의
- [x] `src/config/env.ts`에서 필수 변수 누락 시 명시적 에러 throw
- [x] `.env` 파일이 `.gitignore`에 포함

---

### DB-03. pg 연결 풀(Pool) 설정

| 항목 | 내용 |
|------|------|
| 상세 | `src/config/db.ts`에 `pg.Pool` 인스턴스 생성, 연결 테스트, graceful shutdown |
| 의존성 | DB-02 |
| 예상 소요 | 30분 |

**완료 조건:**
- [x] `pg.Pool` 인스턴스가 환경 변수 기반으로 생성되어 export됨
- [x] 연결 실패 시 `console.error`로 로깅
- [x] `pool.end()` graceful shutdown 처리 존재
- [x] `testConnection()` 함수로 DB 연결 확인 가능

---

### DB-04. User Repository 구현

| 항목 | 내용 |
|------|------|
| 상세 | `createUser`, `findByEmail`, `findById` Raw SQL 구현 |
| 의존성 | DB-03 |
| 예상 소요 | 40분 |

**완료 조건:**
- [x] `createUser`가 INSERT 실행 후 생성된 사용자 반환
- [x] `findByEmail`이 이메일 기반 조회 (password 포함)
- [x] `findById`가 UUID 기반 조회 (password 제외)
- [x] 모든 쿼리가 Parameterized Query ($1, $2) 사용

---

### DB-05. Todo Repository 구현

| 항목 | 내용 |
|------|------|
| 상세 | CRUD + 필터/정렬/페이지네이션 Raw SQL 구현 |
| 의존성 | DB-03 |
| 예상 소요 | 1시간 30분 |

**완료 조건:**
- [x] `create` - INSERT 후 생성된 할일 반환
- [x] `findById` - 단건 조회
- [x] `findByUserId` - 필터(상태), 정렬(시작일/종료일), 페이지네이션(LIMIT/OFFSET) 동적 SQL
- [x] `update` - 동적 SET 절 + `updated_at = CURRENT_TIMESTAMP`
- [x] `updateCompletionStatus` - `is_completed` + `updated_at` 갱신
- [x] `deleteById` - DELETE 실행
- [x] `countByUserId` - 전체 건수 조회
- [x] 모든 쿼리가 Parameterized Query 사용

---

### DB-06. updated_at 갱신 방식 결정

| 항목 | 내용 |
|------|------|
| 상세 | 트리거 vs 애플리케이션 레벨 결정. MVP에서는 Repository 레벨 명시적 처리 권장 |
| 의존성 | DB-01 |
| 예상 소요 | 15분 |

**완료 조건:**
- [x] `updated_at` 갱신 방식 결정 (트리거 or 애플리케이션)
- [x] 결정된 방식이 DB-05 쿼리에 반영 확인

---

### DB-07. 데이터베이스 연결 통합 테스트

| 항목 | 내용 |
|------|------|
| 상세 | Pool 연결, User/Todo Repository CRUD, 제약 조건 위반 테스트 |
| 의존성 | DB-04, DB-05 |
| 예상 소요 | 1시간 30분 |

**완료 조건:**
- [x] DB Pool 연결 테스트 통과
- [x] User Repository CRUD 테스트 통과
- [x] Todo Repository CRUD 테스트 통과
- [x] 페이지네이션 (LIMIT/OFFSET) 테스트 통과
- [x] CHECK 제약 (due_date >= start_date) 위반 테스트 통과
- [x] FK CASCADE 삭제 테스트 통과
- [x] 이메일 UNIQUE 위반 테스트 통과

---

## 3. 백엔드 (BE)

### BE-01. 프로젝트 초기화 및 기본 설정

| 항목 | 내용 |
|------|------|
| 상세 | `backend/` 디렉토리 생성, npm init, TypeScript/Express/pg/JWT/bcrypt 의존성 설치, 스크립트 등록 |
| 의존성 | 없음 |
| 예상 소요 | 30분 |

**완료 조건:**
- [ ] `backend/package.json` 생성, 모든 의존성 명시
- [ ] `backend/tsconfig.json` strict 모드 설정
- [ ] `npm run dev`로 서버 정상 기동
- [ ] `.env.example`에 10개 환경 변수 키 기록

---

### BE-02. 환경 설정 및 DB 연결 모듈

| 항목 | 내용 |
|------|------|
| 상세 | `config/env.ts` (환경 변수 로드), `config/db.ts` (pg Pool) |
| 의존성 | BE-01 |
| 예상 소요 | 20분 |

**완료 조건:**
- [ ] 필수 환경 변수 누락 시 프로세스 종료
- [ ] `pg.Pool` 연결 테스트 통과
- [ ] Pool 인스턴스 싱글톤 export

---

### BE-03. Express 앱 초기화 및 미들웨어

| 항목 | 내용 |
|------|------|
| 상세 | `app.ts` (서버 기동), CORS, JSON 파싱, 전역 에러 핸들러, 커스텀 에러 클래스 (6종 에러 코드) |
| 의존성 | BE-01, BE-02 |
| 예상 소요 | 30분 |

**완료 조건:**
- [ ] `localhost:3000` 서버 접근 가능
- [ ] CORS가 환경 변수 Origin으로 제한
- [ ] 존재하지 않는 경로 → 404 표준 에러 응답
- [ ] 처리되지 않은 예외 → 500 표준 에러 응답
- [ ] AppError 클래스가 VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, DUPLICATE_EMAIL, INTERNAL_ERROR 지원

---

### BE-04. TypeScript 타입 정의

| 항목 | 내용 |
|------|------|
| 상세 | `auth-types.ts`, `todo-types.ts`, `express.d.ts` (req.user 확장) |
| 의존성 | BE-01 |
| 예상 소요 | 20분 |

**완료 조건:**
- [ ] 모든 API 요청/응답 타입 정의
- [ ] TodoStatus enum (Pending, InProgress, Overdue, Completed)
- [ ] `req.user` 타입 확장이 컴파일 에러 없이 동작

---

### BE-05. 유틸리티 모듈 (bcrypt, JWT)

| 항목 | 내용 |
|------|------|
| 상세 | `password-utils.ts` (hashPassword, comparePassword), `jwt-utils.ts` (generateToken, verifyToken) |
| 의존성 | BE-02, BE-04 |
| 예상 소요 | 20분 |

**완료 조건:**
- [ ] `hashPassword`가 bcrypt 해시 반환
- [ ] `comparePassword`가 올바른 비교 결과 반환
- [ ] `generateToken`이 1시간 만료 JWT 반환
- [ ] `verifyToken`이 만료/변조 토큰에 에러 throw

---

### BE-06. JWT 인증 미들웨어

| 항목 | 내용 |
|------|------|
| 상세 | Authorization Bearer 토큰 추출, 검증, `req.user` 설정 |
| 의존성 | BE-03, BE-05 |
| 예상 소요 | 20분 |

**완료 조건:**
- [ ] 토큰 없음 → 401 반환
- [ ] 만료된 토큰 → 401 반환
- [ ] 변조된 토큰 → 401 반환
- [ ] 유효한 토큰 → `req.user`에 userId, email 설정 후 통과

---

### BE-07. User Repository

| 항목 | 내용 |
|------|------|
| 상세 | `findByEmail`, `create` Raw SQL 구현, snake_case → camelCase 매핑 |
| 의존성 | BE-02, BE-04 |
| 예상 소요 | 20분 |

**완료 조건:**
- [ ] `findByEmail` - 존재 시 user 반환, 미존재 시 null
- [ ] `create` - 새 사용자 생성, password 제외 반환
- [ ] 모든 쿼리 파라미터 바인딩 사용

---

### BE-08. Auth Service

| 항목 | 내용 |
|------|------|
| 상세 | `register` (유효성 검증 + 중복 체크 + bcrypt 해싱), `login` (비밀번호 비교 + JWT 발급) |
| 의존성 | BE-05, BE-07 |
| 예상 소요 | 40분 |

**완료 조건:**
- [ ] 유효한 입력 → 사용자 생성 성공
- [ ] 이메일 형식/비밀번호 정책/이름 위반 → VALIDATION_ERROR(400)
- [ ] 이메일 중복 → DUPLICATE_EMAIL(409)
- [ ] 올바른 자격 증명 → JWT 토큰 반환
- [ ] 잘못된 이메일/비밀번호 → 동일한 401 메시지 (계정 존재 여부 비노출)

---

### BE-09. Auth Controller 및 Route

| 항목 | 내용 |
|------|------|
| 상세 | POST /api/auth/register(201), /login(200), /logout(200) |
| 의존성 | BE-06, BE-08 |
| 예상 소요 | 30분 |

**완료 조건:**
- [ ] POST /api/auth/register → 201, 표준 성공 응답
- [ ] POST /api/auth/login → 200, token 포함
- [ ] POST /api/auth/logout → 인증 미들웨어 통과 후 200
- [ ] 모든 에러가 표준 에러 응답 형식

---

### BE-10. Todo Repository

| 항목 | 내용 |
|------|------|
| 상세 | CRUD + 동적 필터/정렬/페이지네이션 Raw SQL, 상태별 WHERE 조건 동적 구성 |
| 의존성 | BE-02, BE-04 |
| 예상 소요 | 50분 |

**완료 조건:**
- [ ] CRUD 기본 오퍼레이션 정상 동작
- [ ] 상태별 필터 SQL 정확 (Pending/InProgress/Overdue/Completed/종료된 할일)
- [ ] start_date/due_date 기준 ASC/DESC 정렬
- [ ] LIMIT/OFFSET 페이지네이션
- [ ] 모든 쿼리 파라미터 바인딩 사용

---

### BE-11. Todo Service

| 항목 | 내용 |
|------|------|
| 상세 | 비즈니스 로직: 유효성 검증, 소유권 검증(BR-02), 날짜 순서(BR-04), 상태 산출, 페이지네이션 메타 |
| 의존성 | BE-10, BE-04 |
| 예상 소요 | 60분 |

**완료 조건:**
- [ ] 유효성 검증 (제목, 설명, 날짜 형식, 날짜 순서)
- [ ] 페이지네이션 메타 (page, size, totalCount, totalPages) 정확 반환
- [ ] size > 100 → 100으로 자동 제한
- [ ] 소유권 불일치 → 403 FORBIDDEN
- [ ] 미존재 할일 → 404 NOT_FOUND
- [ ] `calculateTodoStatus`가 4가지 상태 정확 산출

---

### BE-12. Todo Controller 및 Route

| 항목 | 내용 |
|------|------|
| 상세 | 10개 엔드포인트 라우트 등록, authMiddleware 적용, 표준 응답 |
| 의존성 | BE-06, BE-11 |
| 예상 소요 | 30분 |

**완료 조건:**
- [ ] 10개 API 엔드포인트 라우트 등록
- [ ] 모든 할일 라우트에 authMiddleware 적용
- [ ] 성공 응답 표준 형식 준수
- [ ] 목록 응답에 pagination 객체 포함
- [ ] 삭제 API → 204 No Content

---

### BE-13. 입력값 유효성 검증 미들웨어 (선택)

| 항목 | 내용 |
|------|------|
| 상세 | UUID 검증, 필수 필드 누락 체크, 분산된 검증 로직 통합 |
| 의존성 | BE-03 |
| 예상 소요 | 30분 |

**완료 조건:**
- [ ] 잘못된 UUID → 400 반환
- [ ] 필수 필드 누락 → 400 (구체적 필드명 포함 메시지)
- [ ] Controller/Service 중복 검증 최소화

---

### BE-14. 통합 테스트

| 항목 | 내용 |
|------|------|
| 상세 | Jest + Supertest, 인증 API 6개+ / 할일 API 15개+ 케이스 |
| 의존성 | BE-09, BE-12 |
| 예상 소요 | 90분 |

**완료 조건:**
- [ ] 인증 통합 테스트 최소 6개 케이스 통과
- [ ] 할일 통합 테스트 최소 15개 케이스 통과
- [ ] 미인증 → 401, 타인 데이터 → 403 케이스 포함
- [ ] 모든 테스트 독립 실행 가능

---

### BE-15. 단위 테스트

| 항목 | 내용 |
|------|------|
| 상세 | Service 레이어 단위 테스트: 비밀번호 정책, 상태 산출, 소유권 검증 |
| 의존성 | BE-08, BE-11 |
| 예상 소요 | 60분 |

**완료 조건:**
- [ ] 비밀번호 정책 4가지 위반 케이스 통과
- [ ] 할일 상태 산출 4가지 케이스 통과
- [ ] 소유권 검증 로직 테스트 통과
- [ ] `npm test` 전체 통과

---

## 4. 프론트엔드 (FE)

### FE-01. 프로젝트 초기화 및 개발 환경 구성

| 항목 | 내용 |
|------|------|
| 상세 | Vite + React 19 + TypeScript 생성, Zustand/TanStack Query/Axios 설치, ESLint/Prettier 설정 |
| 의존성 | 없음 |
| 예상 소요 | 1시간 |

**완료 조건:**
- [ ] `npm run dev` → `localhost:5173` 정상 렌더링
- [ ] TypeScript 절대 경로 import 동작
- [ ] ESLint, Prettier 규칙 적용
- [ ] `.env.example` 파일 존재

---

### FE-02. TypeScript 타입 정의

| 항목 | 내용 |
|------|------|
| 상세 | `auth-types.ts`, `todo-types.ts`, `api-types.ts` (제네릭 응답 타입) |
| 의존성 | FE-01 |
| 예상 소요 | 30분 |

**완료 조건:**
- [ ] 3개 타입 파일 컴파일 오류 없음
- [ ] User, Todo 속성이 도메인 정의서와 일치
- [ ] TodoStatus 4종 열거형 정의
- [ ] ApiResponse, ApiListResponse, ApiErrorResponse 제네릭 타입 정의

---

### FE-03. API 클라이언트 및 통신 함수

| 항목 | 내용 |
|------|------|
| 상세 | Axios 인스턴스(인터셉터), auth-api.ts (3개), todo-api.ts (7개) |
| 의존성 | FE-01, FE-02 |
| 예상 소요 | 1시간 |

**완료 조건:**
- [ ] Axios 인스턴스에 baseURL, 인증 헤더 인터셉터 설정
- [ ] 401 응답 시 토큰 초기화 + 로그인 페이지 리다이렉트
- [ ] API 함수 10개 (auth 3 + todo 7) 구현
- [ ] 엔드포인트가 프로젝트 구조 문서와 일치

---

### FE-04. Zustand 인증 스토어

| 항목 | 내용 |
|------|------|
| 상세 | token, user, isAuthenticated 상태, setAuth/clearAuth 액션. 메모리 전용 저장 |
| 의존성 | FE-01, FE-02 |
| 예상 소요 | 30분 |

**완료 조건:**
- [ ] `setAuth` 후 `isAuthenticated === true`
- [ ] `clearAuth` 후 token/user null, `isAuthenticated === false`
- [ ] localStorage/sessionStorage 미사용
- [ ] API 인터셉터에서 `getToken()` 정상 참조

---

### FE-05. 유틸리티 함수

| 항목 | 내용 |
|------|------|
| 상세 | `date-utils.ts` (상태 산출, 날짜 포매팅), `validation-utils.ts` (이메일/비밀번호/제목/날짜 검증) |
| 의존성 | FE-01, FE-02 |
| 예상 소요 | 1시간 |

**완료 조건:**
- [ ] `computeTodoStatus`가 4가지 상태 정확 산출
- [ ] 비밀번호 검증이 PRD 정책 준수
- [ ] 이메일 RFC 5322 형식 + 255자 검증
- [ ] 종료일 < 시작일 시 오류 메시지 반환

---

### FE-06. TanStack Query 커스텀 훅

| 항목 | 내용 |
|------|------|
| 상세 | `useAuth.ts` (useLogin, useRegister, useLogout), `useTodos.ts` (useTodos, useTodoDetail, CRUD mutations) |
| 의존성 | FE-03, FE-04 |
| 예상 소요 | 1시간 30분 |

**완료 조건:**
- [ ] 로그인 성공 시 auth store 토큰 저장 + 목록 페이지 이동
- [ ] CRUD mutation 성공 시 쿼리 캐시 자동 무효화
- [ ] 필터/정렬/페이지 파라미터별 캐싱 분리
- [ ] `QueryClientProvider` 앱 루트 설정

---

### FE-07. 공통 UI 컴포넌트

| 항목 | 내용 |
|------|------|
| 상세 | Button, Input, TextArea, Modal, Pagination, Select, StatusBadge, Header, Layout |
| 의존성 | FE-01 |
| 예상 소요 | 2시간 |

**완료 조건:**
- [ ] 7개 공통 컴포넌트 구현 (Button, Input, TextArea, Modal, Pagination, Select, StatusBadge)
- [ ] Header에 로그아웃 버튼 + 사용자 이름 표시
- [ ] Modal 확인/취소 동작
- [ ] 360px ~ 1280px 반응형 지원

---

### FE-08. 라우터 및 인증 가드

| 항목 | 내용 |
|------|------|
| 상세 | React Router 설정, PrivateRoute (미인증→로그인), PublicRoute (인증→목록) |
| 의존성 | FE-04, FE-07 |
| 예상 소요 | 1시간 |

**완료 조건:**
- [ ] 미인증 사용자 → `/todos` 접근 시 `/login` 리다이렉트
- [ ] 인증된 사용자 → `/login` 접근 시 `/todos` 리다이렉트
- [ ] 루트(`/`) 인증 상태별 올바른 이동
- [ ] 401 토큰 초기화 시 자동 로그인 리다이렉트

---

### FE-09. 회원가입 페이지

| 항목 | 내용 |
|------|------|
| 상세 | RegisterPage + RegisterForm (이름/이메일/비밀번호 유효성, 서버 에러 처리) |
| 의존성 | FE-06, FE-07, FE-08, BE-09 |
| 예상 소요 | 1시간 30분 |

**완료 조건:**
- [ ] 필드별 유효성 오류 메시지 표시
- [ ] 이메일 중복 시 서버 오류 메시지 표시
- [ ] 가입 성공 → 로그인 페이지 이동
- [ ] 360px 모바일 환경 정상 표시

---

### FE-10. 로그인 페이지

| 항목 | 내용 |
|------|------|
| 상세 | LoginPage + LoginForm (자격 증명 검증, 계정 존재 여부 비노출) |
| 의존성 | FE-06, FE-07, FE-08, BE-09 |
| 예상 소요 | 1시간 |

**완료 조건:**
- [ ] 미입력 시 제출 차단
- [ ] 잘못된 자격 증명 → 통합 오류 메시지 (계정 존재 여부 비노출)
- [ ] 로그인 성공 → 토큰 메모리 저장 + 목록 페이지 이동
- [ ] 회원가입 링크 동작

---

### FE-11. 할일 목록 페이지

| 항목 | 내용 |
|------|------|
| 상세 | TodoListPage + TodoFilter + TodoList + TodoItem + TodoCreateForm + Pagination |
| 의존성 | FE-05, FE-06, FE-07, FE-08, BE-12 |
| 예상 소요 | 3시간 |

**완료 조건:**
- [ ] 페이지네이션(20건/페이지)과 함께 목록 표시
- [ ] 상태 필터 5종 + "종료된 할일" 필터 동작
- [ ] 시작일/종료일 기준 오름차순/내림차순 정렬
- [ ] 할일 등록 폼 유효성 검증 + 등록 성공
- [ ] 완료 체크박스 토글 동작
- [ ] 삭제 확인 다이얼로그 + 삭제 동작
- [ ] 360px ~ 1280px 반응형 레이아웃

---

### FE-12. 할일 상세 페이지

| 항목 | 내용 |
|------|------|
| 상세 | TodoDetailPage + TodoEditForm (상세 조회, 수정 모드, 완료/삭제) |
| 의존성 | FE-05, FE-06, FE-07, FE-08, BE-12 |
| 예상 소요 | 2시간 |

**완료 조건:**
- [ ] 상세 정보 전체 표시 (제목, 설명, 날짜, 상태, 생성/수정 일시)
- [ ] 수정 모드 전환 시 기존 값 프리필 + 저장 동작
- [ ] 미존재 할일 → 404 안내 표시
- [ ] 완료/완료 취소 토글 동작
- [ ] 삭제 후 목록 페이지 이동

---

### FE-13. 반응형 UI 및 스타일 통합 점검

| 항목 | 내용 |
|------|------|
| 상세 | 브레이크포인트별(360/480/768/1024/1280px) 전 페이지 점검, 크로스 브라우저 확인 |
| 의존성 | FE-09, FE-10, FE-11, FE-12 |
| 예상 소요 | 1시간 30분 |

**완료 조건:**
- [ ] 360px에서 가로 스크롤 없이 정상 표시
- [ ] 1280px에서 여백/레이아웃 적절
- [ ] 모바일 터치 타겟 44px 이상
- [ ] Chrome, Safari, Edge, Firefox 최신 버전 정상 렌더링

---

### FE-14. 프론트엔드-백엔드 통합 테스트

| 항목 | 내용 |
|------|------|
| 상세 | SCN-01~SCN-10 전체 시나리오 E2E 수동 검증 |
| 의존성 | FE-13, BE-09, BE-12 |
| 예상 소요 | 2시간 |

**완료 조건:**
- [ ] SCN-01 ~ SCN-10 전체 정상 흐름 통과
- [ ] 각 시나리오 예외 흐름(EX-xx-x) 올바른 오류 메시지
- [ ] 토큰 만료 시 자동 로그아웃 + 리다이렉트
- [ ] 새로고침 시 재로그인 필요 확인

---

## 5. 전체 의존성 맵

```
[Day 1: 기반 구축 + 인증]
DB-01 ──────────────────────────────────────> DB-06
DB-02 ──> DB-03 ──> DB-04 (병렬) DB-05 ──> DB-07
BE-01 ──> BE-02 ──> BE-03 ──────────────────> BE-13
     └──> BE-04 ──> BE-05 ──> BE-06
                         └──> BE-08 ──> BE-09
BE-07 ──────────────────> BE-08
FE-01 ──> FE-02 ──> FE-03 ──> FE-06
     └──> FE-07      └──> FE-04 ──> FE-06
                     └──> FE-05

[Day 2: 핵심 기능]
BE-10 ──> BE-11 ──> BE-12
FE-08 ──> FE-09 (병렬) FE-10 (병렬) FE-11 (병렬) FE-12

[Day 3: 통합 + 배포]
BE-14, BE-15
FE-13 ──> FE-14
```

---

## 6. 일자별 실행 계획

### Day 1 (2026-04-01) - 기반 구축 + 인증

| 시간대 | DB | BE | FE |
|--------|----|----|-----|
| 오전 | DB-01, DB-02 | BE-01, BE-04 | FE-01 |
| 오후 전반 | DB-03 | BE-02, BE-03, BE-05 | FE-02, FE-07 |
| 오후 후반 | DB-06 | BE-06, BE-07, BE-08, BE-09 | FE-03, FE-04, FE-05 |

### Day 2 (2026-04-02) - 핵심 기능

| 시간대 | DB | BE | FE |
|--------|----|----|-----|
| 오전 | DB-04, DB-05 | BE-10, BE-13 | FE-06, FE-08 |
| 오후 전반 | - | BE-11 | FE-09, FE-10 |
| 오후 후반 | - | BE-12 | FE-11 |

### Day 3 (2026-04-03) - 통합 + 검증 + 배포

| 시간대 | DB | BE | FE |
|--------|----|----|-----|
| 오전 | DB-07 | BE-14, BE-15 | FE-12 |
| 오후 전반 | - | - | FE-13 |
| 오후 후반 | - | - | FE-14 + 배포 |

---

## 7. 참조 문서

| 문서명 | 경로 | 버전 |
|--------|------|------|
| 도메인 정의서 | [./1-domain-definition.md](./1-domain-definition.md) | v1.1.1 |
| PRD | [./2-prd.md](./2-prd.md) | v1.0.1 |
| 사용자 시나리오 | [./3-user-scenario.md](./3-user-scenario.md) | v1.0.0 |
| 프로젝트 구조 | [./4-project-structure.md](./4-project-structure.md) | v1.0.0 |
| 아키텍처 다이어그램 | [./5-arch-diagram.md](./5-arch-diagram.md) | v1.1.0 |
| ERD | [./6-erd.md](./6-erd.md) | v1.0.0 |
