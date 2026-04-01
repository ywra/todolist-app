# ERD (Entity-Relationship Diagram)

## 변경 이력

| 버전 | 변경일 | 변경 내용 | 작성자 |
|------|--------|-----------|--------|
| v1.0.0 | 2026-04-01 | 최초 작성 | - |

---

## 1. 엔티티-관계 다이어그램

```mermaid 
erDiagram
    USERS ||--o{ TODOS : "owns"

    USERS {
        uuid id PK
        varchar email UK "RFC 5322, 최대 255자"
        varchar password "bcrypt 해시"
        varchar name "최소 1자, 최대 50자"
        timestamp created_at
    }

    TODOS {
        uuid id PK
        uuid user_id FK "USERS.id 참조"
        varchar title "최소 1자, 최대 200자"
        varchar description "선택, 최대 2000자"
        date start_date "ISO 8601, 필수"
        date due_date "ISO 8601, start_date 이상"
        boolean is_completed "기본값 false"
        timestamp created_at
        timestamp updated_at
    }
```

> **참고:** 할일 상태(시작전/진행중/완료 실패/성공 완료)는 `start_date`, `due_date`, `is_completed`, 현재 날짜로부터 산출되는 파생 값이므로 별도 컬럼으로 저장하지 않는다. ([도메인 정의서 §5](./1-domain-definition.md#5-할일-상태-정의) 참조)

---

## 2. 테이블 명세

### 2.1 users

| 컬럼 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 사용자 고유 식별자 |
| email | VARCHAR(255) | UNIQUE, NOT NULL | 로그인 이메일 |
| password | VARCHAR(255) | NOT NULL | bcrypt 해시 비밀번호 |
| name | VARCHAR(50) | NOT NULL | 사용자 이름 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 계정 생성 일시 |

### 2.2 todos

| 컬럼 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| id | UUID | PK, DEFAULT gen_random_uuid() | 할일 고유 식별자 |
| user_id | UUID | FK(users.id), NOT NULL, ON DELETE CASCADE | 소유 사용자 |
| title | VARCHAR(200) | NOT NULL | 할일 제목 |
| description | VARCHAR(2000) | NULL 허용 | 할일 상세 설명 |
| start_date | DATE | NOT NULL | 할일 시작일 |
| due_date | DATE | NOT NULL, CHECK(due_date >= start_date) | 할일 종료일 |
| is_completed | BOOLEAN | NOT NULL, DEFAULT FALSE | 완료 여부 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성 일시 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 최종 수정 일시 |

---

## 3. 인덱스

| 테이블 | 인덱스명 | 컬럼 | 용도 |
|--------|----------|------|------|
| users | idx_users_email | email | 로그인 시 이메일 조회 (UNIQUE 제약으로 자동 생성) |
| todos | idx_todos_user_id | user_id | 사용자별 할일 목록 조회 |

---

## 4. DDL

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

---

## 5. 참조 문서

| 문서명 | 경로 | 버전 |
|--------|------|------|
| 도메인 정의서 | [./1-domain-definition.md](./1-domain-definition.md) | v1.1.0 |
| PRD | [./2-prd.md](./2-prd.md) | v1.0.0 |
| 프로젝트 구조 | [./4-project-structure.md](./4-project-structure.md) | v1.0.0 |
