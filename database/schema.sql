-- ============================================
-- todolist-app 데이터베이스 스키마
-- 기반 문서: docs/6-erd.md v1.0.0
-- ============================================

-- 데이터베이스 생성
CREATE DATABASE todolist;

-- UUID 확장 활성화 (gen_random_uuid 사용)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. users 테이블
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. todos 테이블
-- ============================================
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

-- ============================================
-- 3. 인덱스
-- ============================================
CREATE INDEX idx_todos_user_id ON todos(user_id);
