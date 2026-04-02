# 프론트엔드 스타일 가이드

## 변경 이력

| 버전 | 변경일 | 변경 내용 | 작성자 |
|------|--------|-----------|--------|
| v1.0.0 | 2026-04-02 | 최초 작성 | - |

---

## 1. 디자인 철학

### 1.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **클린 & 미니멀** | 불필요한 장식 요소를 배제하고, 충분한 여백으로 콘텐츠에 집중 |
| **카드 기반 레이아웃** | 정보를 카드 단위로 그룹핑하여 시각적 계층 구조 형성 |
| **모노톤 베이스 + 포인트 컬러** | 흰색/회색 배경에 레드 계열 액센트로 시선 유도 |
| **타이포그래피 대비** | 제목은 크고 굵게, 본문은 가볍게 — 명확한 정보 위계 |
| **일관된 간격 체계** | 8px 기반 간격으로 정렬감과 리듬감 확보 |

### 1.2 디자인 참고

- 깔끔한 비즈니스 웹사이트 스타일 (99designs 레퍼런스 기반)
- 카드형 콘텐츠 배치 + 넓은 여백 + 얇은 구분선
- CTA 버튼에 강한 포인트 컬러 적용

---

## 2. 색상 시스템 (Color Palette)

### 2.1 기본 색상

| 토큰명 | 색상값 | 용도 | 미리보기 |
|--------|--------|------|----------|
| `--color-primary` | `#DC3545` | 주요 CTA 버튼, 강조 링크, 로고 포인트 | 레드 |
| `--color-primary-hover` | `#C82333` | Primary 호버 상태 | 다크 레드 |
| `--color-primary-light` | `#FFF5F5` | Primary 배경 하이라이트 | 연한 레드 |
| `--color-secondary` | `#6C757D` | 보조 버튼, 비활성 텍스트 | 미디엄 그레이 |
| `--color-secondary-hover` | `#5A6268` | Secondary 호버 상태 | 다크 그레이 |

### 2.2 중립 색상 (Neutral)

| 토큰명 | 색상값 | 용도 |
|--------|--------|------|
| `--color-white` | `#FFFFFF` | 카드 배경, 페이지 배경 |
| `--color-bg` | `#F8F9FA` | 전체 페이지 배경 |
| `--color-bg-card` | `#FFFFFF` | 카드/모달 배경 |
| `--color-border` | `#E9ECEF` | 카드 테두리, 구분선 |
| `--color-border-input` | `#CED4DA` | 입력 필드 테두리 |
| `--color-text-primary` | `#212529` | 제목, 주요 텍스트 |
| `--color-text-secondary` | `#6C757D` | 보조 텍스트, 레이블 |
| `--color-text-muted` | `#ADB5BD` | placeholder, 비활성 텍스트 |

### 2.3 상태 색상 (Semantic)

| 토큰명 | 색상값 | 용도 |
|--------|--------|------|
| `--color-success` | `#28A745` | 성공 완료 뱃지, 완료 버튼 |
| `--color-success-bg` | `#D4EDDA` | 성공 뱃지 배경 |
| `--color-danger` | `#DC3545` | 삭제 버튼, 에러 메시지, 완료 실패 뱃지 |
| `--color-danger-bg` | `#F8D7DA` | 에러 배경, 완료 실패 뱃지 배경 |
| `--color-info` | `#007BFF` | 진행중 뱃지, 링크 |
| `--color-info-bg` | `#D1ECF1` | 진행중 뱃지 배경 |
| `--color-warning` | `#FFC107` | 경고 메시지 |
| `--color-warning-bg` | `#FFF3CD` | 경고 배경 |

### 2.4 할일 상태 뱃지 색상

| 상태 | 배경 | 텍스트 | 테두리 |
|------|------|--------|--------|
| 시작전 (Pending) | `#E9ECEF` | `#495057` | `#CED4DA` |
| 진행중 (In Progress) | `#D1ECF1` | `#0C5460` | `#BEE5EB` |
| 완료 실패 (Overdue) | `#F8D7DA` | `#721C24` | `#F5C6CB` |
| 성공 완료 (Completed) | `#D4EDDA` | `#155724` | `#C3E6CB` |

---

## 3. 타이포그래피 (Typography)

### 3.1 폰트 패밀리

```css
:root {
  --font-heading: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

- **Pretendard**: 한국어/영문 모두 깔끔하게 렌더링되는 시스템 폰트
- 시스템 폰트 fallback으로 별도 폰트 로딩 불필요

### 3.2 폰트 크기 스케일

| 토큰명 | 크기 | 줄높이 | 굵기 | 용도 |
|--------|------|--------|------|------|
| `--text-xs` | 12px | 16px | 400 | 캡션, 보조 정보 |
| `--text-sm` | 14px | 20px | 400 | 레이블, 뱃지, 테이블 셀 |
| `--text-base` | 16px | 24px | 400 | 본문 텍스트 |
| `--text-lg` | 18px | 28px | 500 | 카드 제목, 서브 타이틀 |
| `--text-xl` | 20px | 28px | 600 | 섹션 제목 |
| `--text-2xl` | 24px | 32px | 700 | 페이지 제목 |
| `--text-3xl` | 30px | 36px | 700 | 히어로 제목 (로그인/가입) |

### 3.3 텍스트 스타일 규칙

| 요소 | 크기 | 굵기 | 색상 | 예시 |
|------|------|------|------|------|
| 페이지 제목 (H1) | 2xl~3xl | 700 | `--color-text-primary` | "내 할일 목록" |
| 카드 제목 (H2) | xl | 600 | `--color-text-primary` | "할일 등록" |
| 본문 텍스트 | base | 400 | `--color-text-primary` | 할일 설명 내용 |
| 보조 텍스트 | sm | 400 | `--color-text-secondary` | 날짜, 생성일시 |
| 레이블 | sm | 600 | `--color-text-secondary` | "이메일", "비밀번호" |
| 링크 텍스트 | base | 500 | `--color-info` | "회원 가입" |
| 에러 메시지 | sm | 400 | `--color-danger` | "이메일 형식이 올바르지 않습니다." |

---

## 4. 간격 시스템 (Spacing)

8px 기반 간격 체계를 사용한다.

| 토큰명 | 값 | 용도 |
|--------|----|------|
| `--space-1` | 4px | 아이콘과 텍스트 사이, 뱃지 내부 패딩 |
| `--space-2` | 8px | 인라인 요소 간격, 리스트 아이템 내부 |
| `--space-3` | 12px | 폼 필드 간격 |
| `--space-4` | 16px | 카드 내부 패딩, 섹션 내 요소 간격 |
| `--space-5` | 20px | 카드 내부 패딩 (데스크탑) |
| `--space-6` | 24px | 섹션 간 간격 |
| `--space-8` | 32px | 페이지 상하 여백 |
| `--space-10` | 40px | 페이지 섹션 구분 |
| `--space-12` | 48px | 대형 섹션 여백 |

---

## 5. 컴포넌트 스타일

### 5.1 버튼 (Button)

```
┌─────────────────────────────┐
│         버튼 텍스트           │  ← height: 44px, border-radius: 6px
└─────────────────────────────┘
```

| 종류 | 배경 | 텍스트 | 테두리 | 호버 |
|------|------|--------|--------|------|
| Primary | `#DC3545` | `#FFFFFF` | 없음 | `#C82333` |
| Secondary | `#FFFFFF` | `#6C757D` | `#CED4DA` | `#F8F9FA` |
| Danger | `#FFFFFF` | `#DC3545` | `#DC3545` | `#FFF5F5` |
| Success | `#28A745` | `#FFFFFF` | 없음 | `#218838` |
| Ghost | 투명 | `#6C757D` | 없음 | `#F8F9FA` |

**공통 속성:**
- 높이: 44px (모바일 터치 타겟)
- 패딩: 12px 24px
- 글꼴 크기: 15px, 굵기: 600
- border-radius: 6px
- transition: all 0.2s ease
- disabled: opacity 0.5, cursor not-allowed

### 5.2 입력 필드 (Input)

```
레이블 *                           ← font-size: 14px, font-weight: 600
┌────────────────────────────┐
│  Placeholder text          │     ← height: 44px, padding: 12px, border-radius: 6px
└────────────────────────────┘
⚠ 에러 메시지                     ← font-size: 13px, color: danger
```

| 상태 | 테두리 | 배경 |
|------|--------|------|
| 기본 | `#CED4DA` | `#FFFFFF` |
| 포커스 | `#DC3545` + box-shadow | `#FFFFFF` |
| 에러 | `#DC3545` | `#FFF5F5` |
| 비활성 | `#E9ECEF` | `#F8F9FA` |

**공통 속성:**
- 높이: 44px
- border-radius: 6px
- 글꼴 크기: 15px
- focus box-shadow: `0 0 0 3px rgba(220, 53, 69, 0.15)`
- transition: border-color 0.2s, box-shadow 0.2s

### 5.3 카드 (Card)

```
┌──────────────────────────────────────┐
│                                      │  ← padding: 20~24px
│  카드 콘텐츠                          │     border-radius: 8px
│                                      │     background: #FFFFFF
│                                      │     border: 1px solid #E9ECEF
└──────────────────────────────────────┘     box-shadow: 0 1px 3px rgba(0,0,0,0.08)
```

- 배경: `#FFFFFF`
- 테두리: `1px solid #E9ECEF`
- border-radius: 8px
- box-shadow: `0 1px 3px rgba(0, 0, 0, 0.08)`
- 패딩: 20px (모바일) / 24px (데스크탑)
- 호버 시 shadow 강화: `0 4px 12px rgba(0, 0, 0, 0.12)` (클릭 가능한 카드만)

### 5.4 상태 뱃지 (StatusBadge)

```
[ 진행중 ]   ← display: inline-flex, padding: 4px 10px, border-radius: 12px
```

- 패딩: 4px 10px
- border-radius: 12px (pill 형태)
- 글꼴 크기: 12px, 굵기: 600
- 색상: §2.4 상태 뱃지 색상 참조

### 5.5 모달 (Modal)

```
┌──────────────────────────────────┐
│  제목                        [X] │  ← padding: 20px, border-bottom: 1px
├──────────────────────────────────┤
│                                  │
│  본문 콘텐츠                      │  ← padding: 24px
│                                  │
├──────────────────────────────────┤
│              [취소]  [확인]       │  ← padding: 16px 20px, border-top: 1px
└──────────────────────────────────┘
```

- 오버레이: `rgba(0, 0, 0, 0.5)`
- 카드: 최대 너비 480px, border-radius: 12px
- 헤더/푸터 구분선: `1px solid #E9ECEF`
- 애니메이션: fadeIn 0.2s (오버레이) + slideUp 0.2s (모달)

### 5.6 헤더 (Header)

```
┌─────────────────────────────────────────────────────────────┐
│  Todo App                              홍길동  [로그아웃]    │
└─────────────────────────────────────────────────────────────┘
```

- 높이: 56px
- 배경: `#FFFFFF`
- 하단 테두리: `1px solid #E9ECEF`
- 로고: 18px, 굵기 700, 색상 `#212529`
- 좌우 패딩: 24px (데스크탑) / 16px (모바일)
- position: sticky, top: 0, z-index: 100

### 5.7 페이지네이션 (Pagination)

```
[<]  1  [2]  3  [>]
```

- 버튼 크기: 36px x 36px
- border-radius: 6px
- 현재 페이지: 배경 `#DC3545`, 텍스트 `#FFFFFF`
- 다른 페이지: 배경 `#F8F9FA`, 텍스트 `#495057`, 호버 `#E9ECEF`
- 비활성(첫/끝 페이지): opacity 0.4

### 5.8 테이블/리스트 아이템

| 상태 | 배경 | 텍스트 |
|------|------|--------|
| 기본 | `#FFFFFF` | `#212529` |
| 호버 | `#F8F9FA` | `#212529` |
| 완료된 항목 | `#F8F9FA` | `#ADB5BD` (취소선) |

- 행 높이: 52px
- 행 구분선: `1px solid #F1F3F5`
- 체크박스 크기: 20px x 20px, border-radius: 4px
- 완료된 항목: 텍스트에 `text-decoration: line-through`, 색상 muted

---

## 6. 레이아웃

### 6.1 페이지 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  Header (sticky, 56px)                              │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │  Content Area                                 │  │
│  │  max-width: 960px                             │  │
│  │  margin: 0 auto                               │  │
│  │  padding: 32px 24px                           │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- 콘텐츠 최대 너비: 960px
- 중앙 정렬: `margin: 0 auto`
- 좌우 패딩: 24px (데스크탑) / 16px (모바일)

### 6.2 인증 페이지 (로그인/가입)

```
┌─────────────────────────────────────┐
│           (중앙 정렬 카드)            │
│  ┌───────────────────────────┐     │
│  │  max-width: 400px         │     │
│  │  padding: 32px            │     │
│  │  border-radius: 12px      │     │
│  └───────────────────────────┘     │
└─────────────────────────────────────┘
```

- 카드 최대 너비: 400px (로그인) / 440px (가입)
- 수직 중앙 정렬 또는 상단 여백 80px

### 6.3 반응형 브레이크포인트

| 이름 | 범위 | 콘텐츠 너비 | 레이아웃 |
|------|------|-------------|----------|
| mobile | 360px ~ 767px | 100% - 32px | 단일 컬럼, 카드 스택 |
| tablet | 768px ~ 1023px | 720px | 테이블 레이아웃 |
| desktop | 1024px+ | 960px | 전체 테이블, 넓은 여백 |

---

## 7. 애니메이션 & 트랜지션

| 요소 | 속성 | 지속 시간 | 이징 |
|------|------|-----------|------|
| 버튼 호버 | background-color, box-shadow | 0.2s | ease |
| 입력 포커스 | border-color, box-shadow | 0.2s | ease |
| 카드 호버 | box-shadow | 0.2s | ease |
| 모달 등장 | opacity, transform | 0.2s | ease-out |
| Toast 알림 | transform, opacity | 0.3s | ease-out |
| 페이지 전환 | opacity | 0.15s | ease |

- `prefers-reduced-motion: reduce` 미디어 쿼리 시 모든 애니메이션 비활성화

---

## 8. 아이콘

- 별도 아이콘 라이브러리 없이 **유니코드/이모지** 또는 **간단한 SVG** 사용
- 필요한 아이콘 최소 목록:

| 아이콘 | 용도 | 표현 |
|--------|------|------|
| 체크 | 완료 체크박스 | `✓` 또는 SVG |
| 더보기 | 할일 항목 메뉴 | `⋯` |
| 뒤로가기 | 상세→목록 이동 | `←` |
| 닫기 | 모달 닫기 | `×` |
| 추가 | 새 할일 등록 | `+` |
| 정렬 | 오름/내림차순 | `↑` / `↓` |

---

## 9. CSS 변수 종합 (구현용)

```css
:root {
  /* 색상 - Primary */
  --color-primary: #DC3545;
  --color-primary-hover: #C82333;
  --color-primary-light: #FFF5F5;

  /* 색상 - Neutral */
  --color-bg: #F8F9FA;
  --color-bg-card: #FFFFFF;
  --color-border: #E9ECEF;
  --color-border-input: #CED4DA;
  --color-text-primary: #212529;
  --color-text-secondary: #6C757D;
  --color-text-muted: #ADB5BD;

  /* 색상 - Semantic */
  --color-success: #28A745;
  --color-success-bg: #D4EDDA;
  --color-danger: #DC3545;
  --color-danger-bg: #F8D7DA;
  --color-info: #007BFF;
  --color-info-bg: #D1ECF1;

  /* 타이포그래피 */
  --font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;

  /* 간격 */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* 반경 */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-pill: 9999px;

  /* 그림자 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.16);

  /* 트랜지션 */
  --transition-fast: 0.15s ease;
  --transition-normal: 0.2s ease;
  --transition-slow: 0.3s ease-out;

  /* 레이아웃 */
  --header-height: 56px;
  --content-max-width: 960px;
  --z-header: 100;
  --z-modal-overlay: 200;
  --z-modal: 300;
  --z-toast: 400;
}
```

---

## 10. 참조 문서

| 문서명 | 경로 | 버전 |
|--------|------|------|
| 와이어프레임 | [./8-wireframes.md](./8-wireframes.md) | v1.0.0 |
| PRD | [./2-prd.md](./2-prd.md) | v1.0.1 |
| 프로젝트 구조 | [./4-project-structure.md](./4-project-structure.md) | v1.0.0 |
