# 기술 아키텍처 다이어그램

## 변경 이력

| 버전 | 변경일 | 변경 내용 | 작성자 |
|------|--------|-----------|--------|
| v1.0.0 | 2026-03-31 | 최초 작성 | - |
| v1.1.0 | 2026-04-01 | ERD/DDL에서 status 컬럼 제거, users에서 updated_at 제거, 인증 흐름도 토큰 저장 수정, docs 목록에 6-erd.md 추가 | - |
| v1.2.0 | 2026-04-02 | daily_todos, rewards 테이블 DDL 추가, 프로젝트 구조 업데이트 (daily-todo-routes, reward-routes 추가) | - |

---

## 1. 시스템 전체 구조도 (3-Tier 아키텍처)

```mermaid
graph TB
    subgraph Client["🖥️ 클라이언트 레이어"]
        browser["웹 브라우저"]
        react["React 19 + TypeScript"]
        zustand["Zustand<br/>인증 상태 관리"]
        query["TanStack Query<br/>서버 상태 캐싱"]
        
        browser --> react
        react --> zustand
        react --> query
    end
    
    subgraph API["🌐 HTTP/REST"]
        http["JSON 기반<br/>RESTful API"]
    end
    
    subgraph Backend["⚙️ 백엔드 레이어"]
        express["Node.js + Express"]
        jwt["JWT 인증<br/>미들웨어"]
        business["비즈니스 로직<br/>Service Layer"]
        express --> jwt
        express --> business
    end
    
    subgraph Database["💾 데이터 레이어"]
        postgres["PostgreSQL"]
        tables["users | todos"]
        postgres --> tables
    end
    
    Client <-->|HTTP/JSON| API
    API <-->|요청/응답| Backend
    Backend -->|SQL| Database
    
    style Client fill:#e1f5ff
    style API fill:#fff9c4
    style Backend fill:#f3e5f5
    style Database fill:#e8f5e9
```

---

## 2. 백엔드 레이어 흐름도

```mermaid
graph TD
    req["HTTP 요청<br/>/api/todos"]
    
    subgraph Route["🔀 Route Layer"]
        router["Express Router"]
        authMw["JWT 인증<br/>미들웨어"]
        
        router --> authMw
    end
    
    subgraph Controller["🎯 Controller Layer"]
        ctrl["요청 파싱<br/>입력값 검증<br/>응답 형식화"]
    end
    
    subgraph Service["💼 Service Layer"]
        svc["비즈니스 로직<br/>- 소유권 검증<br/>- 날짜 유효성<br/>- 상태 산출"]
    end
    
    subgraph Repository["📦 Repository Layer"]
        repo["Raw SQL 쿼리<br/>데이터 매핑"]
    end
    
    subgraph DB["🗄️ PostgreSQL"]
        database["users / todos<br/>테이블"]
    end
    
    resp["JSON 응답"]
    
    req --> Route
    Route --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> DB
    DB --> Repository
    Repository --> Service
    Service --> Controller
    Controller --> resp
    
    style Route fill:#ffe0b2
    style Controller fill:#c8e6c9
    style Service fill:#bbdefb
    style Repository fill:#f8bbd0
    style DB fill:#ede7f6
```

---

## 3. 인증 흐름도 (JWT 토큰)

```mermaid
graph LR
    user["사용자"]
    
    subgraph Login["1️⃣ 로그인"]
        input["이메일 + 비밀번호<br/>입력"]
        verify["비밀번호 검증<br/>bcrypt 비교"]
        
        input --> verify
    end
    
    subgraph Issue["2️⃣ 토큰 발급"]
        sign["JWT 서명<br/>Secret Key 사용"]
        token["Access Token 생성<br/>만료: 1시간"]
        
        sign --> token
    end
    
    subgraph Store["3️⃣ 토큰 저장"]
        client["클라이언트<br/>Zustand Store<br/>(메모리)"]
    end
    
    subgraph Request["4️⃣ API 요청 시"]
        header["Authorization:<br/>Bearer &lt;token&gt;"]
        intercept["Axios 인터셉터<br/>자동 추가"]
        
        intercept --> header
    end
    
    subgraph Validate["5️⃣ 토큰 검증"]
        middleware["JWT 미들웨어"]
        decode["페이로드 디코딩<br/>서명 확인"]
        check["user_id 추출<br/>req.user 설정"]
        
        middleware --> decode
        decode --> check
    end
    
    subgraph Response["6️⃣ 응답"]
        data["사용자 데이터<br/>반환"]
        error["만료/위조 시<br/>401 Unauthorized"]
    end
    
    user --> Login
    Login --> Issue
    Issue --> Store
    Store --> Request
    Request --> Validate
    Validate --> Response
    
    style Login fill:#c8e6c9
    style Issue fill:#bbdefb
    style Store fill:#ffe0b2
    style Request fill:#f8bbd0
    style Validate fill:#e1bee7
    style Response fill:#fce4ec
```

---

## 4. 엔티티-관계 다이어그램 (ERD)

```mermaid
erDiagram
    USERS ||--o{ TODOS : "owns"
    
    USERS {
        uuid id PK
        string email UK "RFC 5322, 최대 255자"
        string password "bcrypt 해시"
        string name "최소 1자, 최대 50자"
        timestamp created_at
    }
    
    TODOS {
        uuid id PK
        uuid user_id FK "USERS.id 참조"
        string title "최소 1자, 최대 200자"
        string description "선택, 최대 2000자"
        date start_date "ISO 8601"
        date due_date "ISO 8601, start_date 이상"
        boolean is_completed "기본값 false"
        timestamp created_at
        timestamp updated_at
    }
```

---

## 5. API 엔드포인트 흐름

```mermaid
graph TB
    subgraph Auth["🔐 인증 & 프로필 API"]
        POST_REG["POST /api/auth/register<br/>회원 가입 UC-01"]
        POST_LOGIN["POST /api/auth/login<br/>로그인 → Token UC-02"]
        POST_LOGOUT["POST /api/auth/logout<br/>로그아웃 UC-03"]
        GET_PROF["GET /api/auth/profile<br/>프로필 조회 UC-11"]
        PUT_PROF["PUT /api/auth/profile<br/>프로필 수정 UC-11"]
        PUT_PWD["PUT /api/auth/profile/password<br/>비밀번호 변경 UC-12"]
    end
    
    subgraph Todo["✅ 내 할일 API (JWT 필수)"]
        POST_TODO["POST /api/todos<br/>할일 등록 UC-04"]
        GET_TODOS["GET /api/todos<br/>할일 목록 조회 UC-05"]
        GET_TODO["GET /api/todos/:id<br/>할일 상세 조회 UC-06"]
        PUT_TODO["PUT /api/todos/:id<br/>할일 수정 UC-07"]
        PATCH_COMP["PATCH /api/todos/:id/complete<br/>할일 완료 UC-08"]
        DELETE_TODO["DELETE /api/todos/:id<br/>할일 삭제 UC-09"]
        PATCH_INCOMP["PATCH /api/todos/:id/incomplete<br/>할일 완료 취소 UC-10"]
    end
    
    subgraph Daily["🌟 오늘의 할일 API (JWT 필수)"]
        POST_DAILY["POST /api/daily-todos<br/>오늘의 할일 등록 UC-13"]
        GET_DAILY["GET /api/daily-todos<br/>오늘의 할일 목록 UC-14"]
        GET_CAL["GET /api/daily-todos/calendar<br/>달력 조회 UC-15"]
        PATCH_DAILY_COMP["PATCH /api/daily-todos/:id/complete<br/>오늘의 할일 완료 UC-14"]
        PATCH_DAILY_INCOMP["PATCH /api/daily-todos/:id/incomplete<br/>오늘의 할일 취소 UC-14"]
        DELETE_DAILY["DELETE /api/daily-todos/:id<br/>오늘의 할일 삭제"]
    end
    
    subgraph Reward["🏆 보상 API (JWT 필수)"]
        GET_REWARD["GET /api/rewards<br/>보상 현황 조회 UC-17"]
        POST_REWARD["POST /api/rewards<br/>보상 설정 UC-16"]
        PUT_REWARD["PUT /api/rewards/:id<br/>보상 수정 UC-16"]
    end
    
    subgraph Response["📦 응답 형식"]
        SUCCESS["✅ 성공<br/>- success: true<br/>- data: {...}"]
        LIST["📋 목록<br/>- pagination<br/>- page, size, totalCount"]
        ERROR["❌ 에러<br/>- success: false<br/>- error: {code, msg}"]
    end
    
    Auth --> SUCCESS
    Todo --> LIST
    Todo --> SUCCESS
    Todo --> ERROR
    Daily --> LIST
    Daily --> SUCCESS
    Daily --> ERROR
    Reward --> SUCCESS
    Reward --> LIST
    Reward --> ERROR
    
    style Auth fill:#c8e6c9
    style Todo fill:#bbdefb
    style Daily fill:#fff9c4
    style Reward fill:#ffccbc
    style Response fill:#ffe0b2
```

---

## 6. 프론트엔드 데이터 흐름

```mermaid
graph TD
    Page["📄 Page 컴포넌트<br/>라우팅"]
    
    subgraph Components["🎨 Component 레이어"]
        comp1["UI 컴포넌트"]
        comp2["LoginForm"]
        comp3["TodoList"]
    end
    
    subgraph Hooks["🪝 Hooks 레이어"]
        useAuth["useAuth<br/>TanStack Query"]
        useTodos["useTodos<br/>TanStack Query"]
    end
    
    subgraph API["🌐 API 레이어"]
        authAPI["auth-api.ts"]
        todoAPI["todo-api.ts"]
        client["Axios Client<br/>인터셉터"]
    end
    
    subgraph Store["📦 Store"]
        zustand["Zustand<br/>auth-store"]
    end
    
    Backend["⚙️ 백엔드<br>/api/auth/...<br/>/api/todos/..."]
    
    Page --> Components
    Components --> Hooks
    Components --> Store
    Hooks --> API
    API --> client
    client --> Backend
    Store --> client
    
    style Page fill:#e3f2fd
    style Components fill:#c8e6c9
    style Hooks fill:#bbdefb
    style API fill:#f8bbd0
    style Store fill:#ffe0b2
    style Backend fill:#e1bee7
```

---

## 7. 데이터베이스 스키마

### users 테이블

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,  -- bcrypt 해시
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### todos 테이블 (내 할일)

```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    start_date DATE NOT NULL,
    due_date DATE NOT NULL CHECK (due_date >= start_date),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_todos_user_id ON todos(user_id);
```

> **참고:** 할일 상태는 `start_date`, `due_date`, `is_completed`, 현재 날짜로부터 산출되는 파생 값이므로 별도 컬럼으로 저장하지 않는다. ([도메인 정의서 §5](./1-domain-definition.md#5-할일-상태-정의), [ERD §1](./6-erd.md#1-엔티티-관계-다이어그램) 참조)

### daily_todos 테이블 (오늘의 할일)

```sql
CREATE TABLE daily_todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(2000),
    start_date DATE NOT NULL,
    due_date DATE NOT NULL CHECK (due_date >= start_date),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_daily_todos_user_id ON daily_todos(user_id);
```

> **참고:** 오늘의 할일은 todos 테이블과 완전 독립된 별도 시스템이다. (BR-12 참조)

### rewards 테이블 (보상)

```sql
CREATE TABLE rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    milestone INT NOT NULL,                      -- 10, 30, 100
    tier VARCHAR(20) NOT NULL,                  -- 'small', 'medium', 'large'
    title VARCHAR(200) NOT NULL,                -- 보상 제목 (사용자 작성)
    description VARCHAR(2000),                  -- 보상 상세 (사용자 작성)
    is_achieved BOOLEAN NOT NULL DEFAULT FALSE, -- 달성 여부 (자동 달성)
    achieved_at TIMESTAMP,                      -- 달성 일시
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, milestone)                  -- 사용자당 마일스톤별 1개 (BR-16)
);

CREATE INDEX idx_rewards_user_id ON rewards(user_id);
```

> **참고:** 마일스톤은 10, 30, 100이며, 오늘의 할일 완료 개수 기준으로 자동 달성된다. (UC-17, BR-17 참조)

---

## 8. 프로젝트 구조 (모노레포)

```mermaid
graph TD
    Root["todolist-app<br/>모노레포"]
    
    subgraph Frontend["frontend/"]
        public["public/"]
        src["src/"]
        src_api["api/ (auth-api, todo-api, daily-todo-api, reward-api)"]
        src_comp["components/ (auth, todo, daily-todo, reward, common)"]
        src_hooks["hooks/ (useAuth, useTodos, useDailyTodos, useRewards)"]
        src_pages["pages/ (LoginPage, TodoListPage, ProfilePage, DailyTodoPage, RewardPage)"]
        src_stores["stores/ (auth-store, theme-store)"]
        src_types["types/ (auth, todo, daily-todo, reward, api)"]
        src_utils["utils/ (validation, date, format)"]
        
        src --> src_api
        src --> src_comp
        src --> src_hooks
        src --> src_pages
        src --> src_stores
        src --> src_types
        src --> src_utils
    end
    
    subgraph Backend["backend/"]
        bsrc["src/"]
        config["config/ (db, env)"]
        controllers["controllers/ (auth, todo, daily-todo, reward)"]
        middlewares["middlewares/ (auth, error)"]
        repositories["repositories/ (user, todo, daily-todo, reward)"]
        routes["routes/ (auth, todo, daily-todo, reward, index)"]
        services["services/ (auth, todo, daily-todo, reward)"]
        btypes["types/ (auth, todo, daily-todo, reward, express.d)"]
        utils["utils/ (password, jwt, error)"]
        btests["tests/ (unit, integration)"]
        
        bsrc --> config
        bsrc --> controllers
        bsrc --> middlewares
        bsrc --> repositories
        bsrc --> routes
        bsrc --> services
        bsrc --> btypes
        bsrc --> utils
    end
    
    subgraph Docs["docs/"]
        doc1["1-domain-definition.md"]
        doc2["2-prd.md"]
        doc3["3-user-scenario.md"]
        doc4["4-project-structure.md"]
        doc5["5-arch-diagram.md"]
        doc6["6-erd.md"]
    end
    
    Root --> Frontend
    Root --> Backend
    Root --> Docs
    Root --> ".gitignore"
    Root --> "README.md"
    
    Frontend --> "package.json"
    Frontend --> "tsconfig.json"
    Frontend --> "vite.config.ts"
    Backend --> "package.json"
    Backend --> "tsconfig.json"
    
    style Frontend fill:#e3f2fd
    style Backend fill:#f3e5f5
    style Docs fill:#fff9c4
```

---

## 9. 배포 흐름

```mermaid
graph LR
    Dev["👨‍💻 개발"]
    Git["📁 Git<br/>main 브랜치"]
    
    subgraph Build["🔨 빌드"]
        buildFE["프론트엔드<br/>React 빌드<br/>dist/"]
        buildBE["백엔드<br/>TypeScript 컴파일<br/>build/"]
    end
    
    subgraph Deploy["🚀 배포"]
        deployFE["정적 호스팅<br/>CDN"]
        deployBE["서버 배포<br/>Node.js 인스턴스"]
    end
    
    Prod["🌍 운영<br/>https://example.com"]
    
    Dev --> Git
    Git --> Build
    buildFE --> Deploy
    buildBE --> Deploy
    Deploy --> Prod
    
    style Dev fill:#c8e6c9
    style Git fill:#bbdefb
    style Build fill:#f8bbd0
    style Deploy fill:#ffe0b2
    style Prod fill:#e1bee7
```

---

## 10. 기술 스택 요약

### 프론트엔드

| 계층 | 기술 | 용도 |
|-----|------|------|
| UI Framework | React 19 + TypeScript | 컴포넌트 기반 UI |
| 상태 관리 | Zustand | 인증 토큰, UI 상태 (클라이언트) |
| 서버 상태 | TanStack Query | API 데이터 페칭, 캐싱 |
| HTTP Client | Axios | RESTful API 통신 |
| 번들러 | Vite | 개발·빌드 도구 |
| 코드 스타일 | ESLint, Prettier | 린팅, 포매팅 |

### 백엔드

| 계층 | 기술 | 용도 |
|-----|------|------|
| 런타임 | Node.js | JavaScript 서버 |
| 프레임워크 | Express | RESTful API 서버 |
| 언어 | TypeScript | 타입 안정성 |
| 데이터베이스 | PostgreSQL | 관계형 데이터 저장 |
| 드라이버 | pg | 순수 SQL 실행 |
| 인증 | JWT (jsonwebtoken) | 토큰 기반 인증 |
| 비밀번호 | bcrypt | 해시 암호화 |
| 검증 | Express Validator | 입력값 검증 |
| 테스트 | Jest, Supertest | 단위·통합 테스트 |

---

## 11. 핵심 설계 원칙

### 아키텍처 원칙

1. **3-Tier 분리**: 프론트엔드-백엔드-DB 완전 분리
2. **RESTful API**: HTTP 표준 메서드 사용
3. **Stateless 인증**: JWT 토큰 방식 (서버 세션 없음)
4. **ORM 미사용**: Raw SQL로 쿼리 투명성 확보
5. **레이어 단방향**: Route → Controller → Service → Repository

### 코드 원칙

- **Type Safety**: TypeScript 100% 커버리지
- **Separation of Concerns**: 레이어별 책임 명확화
- **No Circular Dependencies**: 순환 의존성 금지
- **API 표준화**: 요청/응답 형식 통일

### 보안 원칙

- JWT Secret 환경 변수 관리
- bcrypt를 이용한 비밀번호 해시
- CORS 헤더 설정
- 소유권 검증 (403 Forbidden)

---

## 12. 참조 문서

| 문서명 | 경로 | 버전 | 설명 |
|--------|------|------|------|
| 도메인 정의서 | [./1-domain-definition.md](./1-domain-definition.md) | v1.2.0 | 도메인 모델 (Todo, DailyTodo, Reward), 유스케이스, 비즈니스 규칙 |
| PRD | [./2-prd.md](./2-prd.md) | v1.0.0 | 기술 스택, 목표, 마일스톤 |
| 사용자 시나리오 | [./3-user-scenario.md](./3-user-scenario.md) | v1.1.0 | 실제 사용자 흐름 (SCN-01 ~ SCN-17) |
| 프로젝트 구조 | [./4-project-structure.md](./4-project-structure.md) | v1.0.0 | 디렉토리, 레이어, 네이밍 규칙 |
| ERD | [./6-erd.md](./6-erd.md) | v1.0.0 | 엔티티 관계 다이어그램 |
| 실행계획서 | [./7-execution-plan.md](./7-execution-plan.md) | v1.1.0 | 프로젝트 Task 및 완료 상태 |

---

## 13. 다이어그램 사용 가이드

### 다이어그램별 용도

- **§1 시스템 전체 구조도**: 전체 아키텍처 이해, 외부 인사 교육
- **§2 백엔드 레이어 흐름도**: API 요청-응답 흐름, 백엔드 개발자 온보딩
- **§3 인증 흐름도**: JWT 생명주기, 보안 검토
- **§4 ERD**: 데이터 구조, DB 설계 검토
- **§5 API 엔드포인트**: API 명세, 프론트엔드 개발
- **§6 프론트엔드 데이터 흐름**: 상태 관리 이해, 프론트엔드 개발
- **§8 프로젝트 구조**: 파일 탐색, 온보딩

### 수정 시 주의사항

- Mermaid 문법이 변경되었을 경우 반드시 프리뷰로 검증
- 새로운 엔드포인트 추가 시 §5 다이어그램 업데이트
- 테이블 스키마 변경 시 §4 및 §7 업데이트
- 레이어 구조 변경 시 §2 및 §6 업데이트
- 버전 업그레이드 시 §10 기술 스택 수정

