# E2E 통합 테스트 결과 보고서 (SCN-01 ~ SCN-17)

## 테스트 환경
| 항목 | 내용 |
|------|------|
| 테스트 도구 | Playwright MCP |
| 테스트 일시 | 2026-04-02 16:25 KST |
| 백엔드 서버 | http://localhost:3000 |
| 프론트엔드 서버 | http://localhost:5173 |
| 테스트 계정 | e2ev2@test.com / Test1234! |
| 참조 문서 | docs/3-user-scenario.md v1.1.0 |

---

## 테스트 결과 요약: 17/17 PASS

### 인증 & 프로필 (SCN-01 ~ SCN-03, SCN-11 ~ SCN-12)

| # | 시나리오 | 테스트 방법 | 결과 | 스크린샷 |
|---|---------|-----------|------|----------|
| SCN-01 | 회원가입 → 로그인 페이지 이동 | UI | **PASS** | SCN-01-register.png |
| SCN-02 | 로그인 → /todos 이동 | UI | **PASS** | SCN-02-login.png |
| SCN-03 | 로그아웃 → /login 리다이렉트 | UI | **PASS** | SCN-03-logout.png |
| SCN-11 | 프로필 수정 (이름 변경) | API | **PASS** | SCN-11-12-profile.png |
| SCN-12 | 비밀번호 변경 (200 응답) | API | **PASS** | SCN-11-12-profile.png |

### 내 할일 목록 (SCN-04 ~ SCN-10)

| # | 시나리오 | 테스트 방법 | 결과 | 검증 내용 |
|---|---------|-----------|------|-----------|
| SCN-04 | 할일 등록 2건 | API | **PASS** | 프로젝트 기획, 코드 리뷰 |
| SCN-05 | 목록 조회 | API + UI | **PASS** | 2건 표시, SCN-05-todo-list.png |
| SCN-06 | 상세 조회 | API | **PASS** | 프로젝트 기획 상세 |
| SCN-07 | 수정 (제목+종료일) | API | **PASS** | "프로젝트 기획 (수정)", 2026-04-12 |
| SCN-08 | 완료 처리 | API | **PASS** | isCompleted=true |
| SCN-09 | 삭제 | API | **PASS** | 삭제 후 2건 |
| SCN-10 | 완료 취소 | API | **PASS** | isCompleted=false |

### 오늘의 할일 (SCN-13 ~ SCN-15)

| # | 시나리오 | 테스트 방법 | 결과 | 검증 내용 |
|---|---------|-----------|------|-----------|
| SCN-13 | 오늘의 할일 등록 | API | **PASS** | 수학 공부, 영어 단어 |
| SCN-14 | 완료 처리 | API | **PASS** | 완료 + 보상 카운트 증가 |
| SCN-15 | 달력 조회 | API + UI | **PASS** | 달력 마커 표시, SCN-13-15-daily-calendar.png |

### 보상 (SCN-16 ~ SCN-17)

| # | 시나리오 | 테스트 방법 | 결과 | 검증 내용 |
|---|---------|-----------|------|-----------|
| SCN-16 | 보상 3개 설정 | API | **PASS** | 치킨(10), 영화(30), 여행(100) |
| SCN-17 | 10개 달성 → 자동 보상 | API + UI | **PASS** | 완료=10, 달성=치킨, SCN-16-17-rewards.png |

### 추가 검증

| # | 항목 | 결과 |
|---|------|------|
| 1 | 내 할일 / 오늘의 할일 완전 분리 | **PASS** (todos=2, daily=11, 교차 없음) |
| 2 | 보상은 오늘의 할일에서만 카운트 | **PASS** |
| 3 | Header 네비게이션 4개 (내 할일/오늘의 할일/보상/프로필) | **PASS** |
| 4 | 날짜 포매팅 (YYYY년 M월 D일) | **PASS** |
| 5 | 달력 날짜별 마커 (빨간●) | **PASS** |
| 6 | 보드게임 말판 (1구간 초록) | **PASS** |
| 7 | 골드 카드 (10개 달성) | **PASS** |

---

## 발견된 버그
없음

## 테스트 파일 목록
- SCN-01-register.png
- SCN-02-login.png
- SCN-03-logout.png
- SCN-05-todo-list.png
- SCN-11-12-profile.png
- SCN-13-15-daily-calendar.png
- SCN-16-17-rewards.png
- E2E-TEST-REPORT.md (본 파일)
