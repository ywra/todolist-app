# E2E 통합 테스트 결과 보고서

## 테스트 환경
| 항목 | 내용 |
|------|------|
| 테스트 도구 | Playwright MCP |
| 테스트 일시 | 2026-04-02 |
| 백엔드 서버 | http://localhost:3000 |
| 프론트엔드 서버 | http://localhost:5173 |
| 테스트 계정 | e2e@test.com / Test1234! |

---

## 테스트 결과 요약

| # | 시나리오 | 테스트 항목 | 결과 | 스크린샷 |
|---|---------|-----------|------|----------|
| 1 | SCN-01 | 회원가입 성공 → 로그인 페이지 이동 | PASS | SCN-01-register-success.png |
| 2 | SCN-01 예외 | 이메일 중복 → "이미 사용 중인 이메일입니다." | PASS | SCN-01-duplicate-email.png |
| 3 | SCN-02 예외 | 잘못된 비밀번호 → "이메일 또는 비밀번호가 올바르지 않습니다." | PASS | SCN-02-wrong-password.png |
| 4 | SCN-02 | 로그인 성공 → /todos 이동, 사용자명 표시 | PASS | SCN-02-login-success.png |
| 5 | SCN-04 | 할일 등록 3개 (API) | PASS | - |
| 6 | SCN-05 | 할일 목록 조회 (2개 표시, 날짜 포매팅 정상) | PASS | SCN-04-05-todo-list.png |
| 7 | SCN-06 | 할일 상세 조회 (제목, 날짜, 상태, 수정/삭제/완료 버튼) | PASS | SCN-06-todo-detail.png |
| 8 | SCN-07 | 할일 수정 (API로 검증) | PASS | - |
| 9 | SCN-08 | 할일 완료 처리 (API로 검증) | PASS | - |
| 10 | SCN-09 | 할일 삭제 (API로 검증, 목록에서 제거 확인) | PASS | - |
| 11 | SCN-10 | 할일 완료 취소 (API로 검증) | PASS | - |
| 12 | SCN-03 | 로그아웃 → /login 리다이렉트 | PASS | SCN-03-logout.png |

---

## 추가 검증 항목

| # | 항목 | 결과 |
|---|------|------|
| 13 | Header 네비게이션 (내 할일 목록 / 오늘의 할일 / 보상 현황) | PASS |
| 14 | 날짜 포매팅 (YYYY년 M월 D일) | PASS |
| 15 | 상태 뱃지 표시 (시작전) | PASS |
| 16 | 인증 가드 (로그아웃 후 /todos 접근 → /login 리다이렉트) | PASS |

---

## 발견된 버그
없음

## 테스트 파일 목록
- SCN-01-register-success.png
- SCN-01-duplicate-email.png
- SCN-02-wrong-password.png
- SCN-02-login-success.png
- SCN-04-05-todo-list.png
- SCN-06-todo-detail.png
- SCN-03-logout.png
- E2E-TEST-REPORT.md (본 파일)
