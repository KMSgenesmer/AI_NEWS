# UI 가이드: AI뉴스 모아보기

`PRD.md`의 화면 구성(§6)을 Tailwind CSS 4 기준으로 구체화한 UI 가이드. 모든 문구는 한국어로 작성한다.

## 1. 디자인 원칙

- **깔끔함**: 흰 배경 위에 여백을 넉넉히 두고, 장식은 줄이고 정보 위계(제목 > 요약 > 메타)로 구분한다.
- **카드 중심**: 모든 정보는 둥근 카드 단위로 묶는다. 카드는 얇은 테두리 + 아주 약한 그림자, 호버 시 살짝 떠오른다.
- **포인트 컬러 하나**: 인디고를 주 색상으로 쓰고, 카테고리 구분용 색은 작은 점/배지에만 사용한다.
- **라이트/다크 지원**: 기존 `globals.css`의 `prefers-color-scheme`을 따르며, 색상은 `dark:` 변형으로 함께 지정한다.
- **반응형**: 모바일 우선(1열) → 태블릿(2열) → 데스크톱(3열).

## 2. 디자인 토큰

### 색상 (Tailwind 기본 팔레트 사용)

| 용도 | 라이트 | 다크 |
|---|---|---|
| 페이지 배경 | `bg-slate-50` | `dark:bg-neutral-950` |
| 카드 배경 | `bg-white` | `dark:bg-neutral-900` |
| 카드 테두리 | `border-slate-200` | `dark:border-neutral-800` |
| 본문/제목 | `text-slate-900` | `dark:text-neutral-100` |
| 보조 텍스트 | `text-slate-500` | `dark:text-neutral-400` |
| 주 색상(버튼, 활성) | `bg-indigo-600 hover:bg-indigo-700 text-white` | 동일 |
| 주 색상 연한 배경 | `bg-indigo-50 text-indigo-700` | `dark:bg-indigo-950 dark:text-indigo-300` |
| 오류 | `text-red-600 bg-red-50` | `dark:bg-red-950 dark:text-red-300` |
| 성공(저장됨) | `text-emerald-700 bg-emerald-50` | `dark:bg-emerald-950 dark:text-emerald-300` |

### 카테고리 색 (점/배지용)

| 카테고리 | 색 | 카테고리 | 색 |
|---|---|---|---|
| 정치 | `rose` | 문화 | `violet` |
| 경제 | `amber` | 스포츠 | `emerald` |
| 사회 | `sky` | 미분류 | `slate` |
| 국제 | `teal` | IT/과학 | `indigo` |

- 사용자가 추가한 카테고리는 이름 해시 기반으로 위 색 중 하나를 자동 배정한다 (색 선택 UI는 두지 않는다).
- Tailwind는 동적 클래스명을 감지하지 못하므로 색 매핑은 **전체 클래스 문자열을 상수 객체로** 작성한다.

```ts
// 예: src/lib/category-color.ts
export const CATEGORY_COLORS = {
  rose:    { dot: "bg-rose-500",    badge: "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300" },
  amber:   { dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" },
  // ... sky, teal, violet, emerald, indigo, slate
} as const;
```

### 타이포그래피

- 폰트: 한글 가독성을 위해 `Pretendard`(권장) 또는 시스템 `sans-serif`. `globals.css`의 `Arial` 고정은 제거하고 `font-sans`를 사용한다.
- 앱 제목 `text-xl font-bold tracking-tight`
- 섹션 제목 `text-lg font-semibold`
- 카드 제목 `text-base font-semibold leading-snug`
- 요약 본문 `text-sm leading-relaxed text-slate-600`
- 메타 정보 `text-xs text-slate-500`

### 형태

- 카드 `rounded-2xl border shadow-sm`, 호버 `hover:shadow-md hover:-translate-y-0.5 transition`
- 버튼/입력 `rounded-lg`, 배지/탭 `rounded-full`
- 카드 패딩 `p-5`, 그리드 간격 `gap-4 sm:gap-6`
- 최대 폭 `max-w-6xl mx-auto px-4 sm:px-6`

## 3. 화면 구성

### 3.1 공통 헤더 (sticky)

```
┌──────────────────────────────────────────────────────────┐
│ 📰 AI뉴스 모아보기                  [뉴스 가져오기]  (프로필) │
└──────────────────────────────────────────────────────────┘
```

- `sticky top-0 z-10 border-b bg-white/80 backdrop-blur dark:bg-neutral-950/80`
- 좌측: 로고 아이콘 + 앱 이름 "AI뉴스 모아보기"
- 우측: **뉴스 가져오기** 주 버튼(아이콘 포함), Clerk `UserButton`
- 가져오는 중: 버튼 비활성화 + 스피너 + "가져오는 중…" 문구. 모바일에서는 버튼을 아이콘만 표시해도 된다.

### 3.2 메인 화면: 카테고리 대시보드 (`/dashboard`)

카테고리별 **카드뉴스 묶음 카드**를 그리드로 보여주는 메인 화면.

```
오늘의 뉴스                              마지막 수집: 오늘 09:12
총 50건 · 8개 카테고리

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ ● 정치    12 │ │ ● 경제     9 │ │ ● 사회     8 │
│ 최신 헤드라인 │ │ 최신 헤드라인 │ │ 최신 헤드라인 │
│ · 제목 1     │ │ · 제목 1     │ │ · 제목 1     │
│ · 제목 2     │ │ · 제목 2     │ │ · 제목 2     │
│ · 제목 3     │ │ · 제목 3     │ │ · 제목 3     │
│      보기 →  │ │      보기 →  │ │      보기 →  │
└─────────────┘ └─────────────┘ └─────────────┘
       …                                   ┌ ┄ ┄ ┄ ┐
                                           ┆  ＋     ┆
                                           ┆ 카테고리 ┆
                                           ┆  추가   ┆
                                           └ ┄ ┄ ┄ ┘
```

**카테고리 카드**
- 상단: 색 점 + 카테고리 이름(`font-semibold`) + 우측에 기사 수 배지(`rounded-full bg-slate-100 px-2.5 py-0.5 text-xs`)
- 중단: 최신 기사 제목 3개를 한 줄 말줄임(`truncate`)으로 미리보기. 기사가 없으면 "아직 뉴스가 없어요" (`text-slate-400`)
- 하단: "보기 →" 텍스트 링크(`text-indigo-600`)
- 카드 전체가 클릭 영역(`<Link>`), `focus-visible:ring-2 ring-indigo-500`로 키보드 포커스 표시
- 그리드: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6`
- "미분류" 카드는 항상 마지막에 두고, 기사가 0건이면 숨긴다.

**카테고리 추가 카드 (그리드 마지막 칸)**
- 점선 테두리 카드: `border-2 border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600`
- 중앙에 `+` 아이콘과 "카테고리 추가" 문구. 클릭 시 추가 모달 열기(§3.4).
- 헤더 영역에도 보조 버튼 "＋ 카테고리 추가"(`border bg-white`)를 두어 카드가 아래로 밀려도 접근할 수 있게 한다.

### 3.3 카테고리 화면: 카드뉴스 목록 (`/dashboard/[id]`, 전체 보기는 `/dashboard/all`)

카테고리 카드를 누르면 이동하는 화면. 해당 카테고리의 뉴스를 카드로 나열한다.

```
← 전체 카테고리                          [이름 수정] [삭제]
● 정치  (12)

[전체] [정치] [경제] [사회] [국제] [IT/과학] [문화] [스포츠]   ← 탭

┌──────────────────┐ ┌──────────────────┐ ┌─────────────
│ [정치]            │ │ …                │ │
│ 기사 제목 …       │ │                  │ │
│ 한국어 요약 …     │ │                  │ │
│ 연합뉴스·김기자·2시간 전│                  │ │
│ [원문 보기][노션 저장]│                 │ │
└──────────────────┘ └──────────────────┘ └─────────────
```

- 상단: "← 전체 카테고리" 뒤로가기 링크, 카테고리 이름/기사 수, 우측에 "이름 수정"·"삭제" 보조 버튼(§3.4). "미분류"는 수정/삭제 불가.
- **카테고리 탭**: 가로 스크롤 가능한 pill 탭(`flex gap-2 overflow-x-auto`). 활성 탭은 `bg-indigo-600 text-white`, 비활성은 `bg-white border text-slate-600 hover:bg-slate-100`. 맨 앞에 "전체" 탭, 이어서 카테고리 탭들. 탭 클릭 시 해당 카테고리 화면으로 이동한다.
- 기사 그리드: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6`
- 정렬: 발행 시각 최신순.

### 3.4 뉴스 카드 (공통 컴포넌트)

구성 순서(위 → 아래):

1. **카테고리 배지** — 색 배지(`rounded-full px-2.5 py-0.5 text-xs font-medium`). 카테고리 화면 안에서는 생략해도 된다.
2. **제목** — `text-base font-semibold leading-snug`, 최대 2줄(`line-clamp-2`), 제목 자체가 원문 링크(`target="_blank" rel="noopener noreferrer"`)
3. **한국어 요약** — `text-sm leading-relaxed text-slate-600`, 최대 4줄(`line-clamp-4`)
4. **메타** — `언론사 · 기자명 · 3시간 전` (`text-xs text-slate-500`). 기자명이 null이면 생략한다. 시간은 상대 표기("방금 전", "N분/시간/일 전").
5. **액션 바** — 상단 얇은 구분선(`border-t pt-3`) 아래 좌우 배치
   - 좌: "원문 보기 ↗" 텍스트 링크
   - 우: **NOTION저장** 버튼

카드 컨테이너: `flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm`, 액션 바는 `mt-auto`로 하단 고정해 카드 높이가 달라도 버튼 위치를 맞춘다.

**NOTION저장 버튼 상태**

| 상태 | 표시 | 스타일 |
|---|---|---|
| 기본 | `NOTION저장` | `border bg-white text-slate-700 hover:bg-slate-50` |
| 저장 중 | 스피너 + `저장 중…` | 비활성, `opacity-60` |
| 저장됨 | ✓ `저장됨` (클릭 시 노션 페이지 열기) | `bg-emerald-50 text-emerald-700` |
| 실패 | `다시 시도` + 카드 하단 오류 문구 | `text-red-600`, 문구 `text-xs` |

저장됨 상태에서는 중복 저장을 막기 위해 저장 동작을 다시 실행하지 않는다.

### 3.5 카테고리 추가/수정/삭제

- **추가·이름 수정**: 중앙 모달(`fixed inset-0 bg-black/40` 오버레이 + `max-w-sm rounded-2xl bg-white p-6`). 제목 "카테고리 추가" / "카테고리 이름 수정", 텍스트 입력 1개(자동 포커스), 하단 `[취소]`(보조) `[추가]`/`[저장]`(주 버튼). Enter로 제출, Esc로 닫기.
- **검증 메시지**: 빈 값 → "이름을 입력해 주세요", 중복 → "이미 있는 카테고리예요" (입력 아래 `text-xs text-red-600`)
- **삭제**: 확인 모달 "‘정치’ 카테고리를 삭제할까요? 이 카테고리의 뉴스 N건은 ‘미분류’로 이동합니다." `[취소]` `[삭제]`(빨강 `bg-red-600`)
- 모달은 `role="dialog" aria-modal="true"`를 지정하고 포커스를 가둔다.

### 3.6 상태 화면

| 상황 | 표시 |
|---|---|
| 첫 방문, 기사 없음 | 대시보드 중앙에 큰 아이콘 + "아직 가져온 뉴스가 없어요" + 주 버튼 **뉴스 가져오기** |
| 가져오는 중 | 대시보드 상단에 진행 배너(`bg-indigo-50`)와 스피너 "네이버 인기 뉴스를 가져와 요약하는 중이에요…". 카드 영역은 스켈레톤(`animate-pulse` 회색 블록) |
| 가져오기 성공 | 배너 "새 뉴스 N건을 추가했어요" 후 5초 뒤 자동 사라짐 |
| 가져오기 실패 | 빨간 배너 + "다시 시도" 버튼 |
| 카테고리에 기사 없음 | 카드 영역에 "이 카테고리에는 아직 뉴스가 없어요" |

### 3.7 로그인 화면

Clerk 컴포넌트를 화면 중앙에 배치하고, 위에 앱 이름 "AI뉴스 모아보기"와 한 줄 설명을 둔다. 배경은 `bg-slate-50`.

## 4. 컴포넌트 구조 (제안)

```
src/
├─ app/
│  └─ dashboard/
│     ├─ layout.tsx               # 로그인 확인, 헤더, 본문 건너뛰기 링크
│     ├─ page.tsx                 # 카테고리 대시보드
│     └─ [id]/page.tsx            # 카테고리별 카드뉴스 목록 (id 또는 all)
└─ components/
   ├─ site-header.tsx             # 헤더 (제목, 뉴스 가져오기, UserButton)
   ├─ fetch-news-button.tsx       # 가져오기 버튼 + 진행/결과 배너
   ├─ category-card.tsx           # 대시보드의 카테고리 카드
   ├─ add-category-card.tsx       # 점선 "카테고리 추가" 카드
   ├─ category-tabs.tsx           # pill 탭
   ├─ category-modal.tsx          # 추가/수정/삭제 확인 모달
   ├─ news-card.tsx               # 뉴스 카드
   ├─ notion-save-button.tsx      # NOTION저장 상태 버튼
   └─ empty-state.tsx / skeleton  # 빈 상태, 로딩 스켈레톤
```

- 목록 조회는 서버 컴포넌트에서, 클릭 상호작용(모달, 버튼 상태)이 필요한 부분만 `"use client"`로 분리한다.
- 같은 카드를 다시 쓰도록 `news-card`, `category-card`에 표시용 props만 받게 한다.

## 5. 접근성 · 반응형 체크리스트

- [ ] 모든 버튼/링크에 `focus-visible:ring-2 focus-visible:ring-indigo-500` 적용
- [ ] 아이콘만 있는 버튼에는 `aria-label` 지정
- [ ] 텍스트 대비는 WCAG AA(본문 4.5:1) 이상 — 보조 텍스트는 `slate-500`보다 연하게 쓰지 않는다
- [ ] 색만으로 카테고리를 구분하지 않고 항상 이름 텍스트를 함께 표시
- [ ] 외부 링크는 `target="_blank" rel="noopener noreferrer"`
- [ ] 로딩/저장 결과 메시지는 `role="status"` 또는 `aria-live="polite"`
- [ ] 360px 폭에서 가로 스크롤이 생기지 않는다 (탭 영역만 예외)
- [ ] 터치 대상은 최소 높이 40px (`py-2.5` 이상)

## 6. 적용 시 참고

- `globals.css`: `body`의 `font-family: Arial…`을 제거하고 `@theme`에 한글 폰트 변수를 연결한다.
- `layout.tsx`: 메타데이터 title을 "AI뉴스 모아보기"로 변경한다 (현재 "AI 뉴스 요약").
- 카테고리 삭제 시 기사 이동("미분류")은 서버 로직에서 처리하며, UI는 확인 문구로 이를 안내한다 (PRD §5.5).
