# AI뉴스 모아보기

AI 관련 뉴스를 RSS로 수집해 Claude가 한국어로 요약하고 카테고리별로 자동 분류한 뒤, 카드 형태로 보여주는 개인용 웹앱입니다. 마음에 드는 뉴스는 클릭 한 번으로 노션에 저장할 수 있습니다.

## 주요 기능

- **로그인**: Clerk 인증. 로그인하지 않으면 접근할 수 없습니다.
- **뉴스 가져오기**: RSS 소스(TechCrunch, The Verge 등)에서 최근 24시간 기사를 수집합니다. 기사 URL 기준으로 중복을 건너뛰며, 요약과 링크만 저장하고 본문 전체는 저장하지 않습니다.
- **요약·분류**: Claude(Haiku)가 기사를 묶음 단위로 한국어 제목·요약으로 만들고 카테고리를 자동 선택합니다. 맞는 카테고리가 없으면 "미분류"로 처리합니다.
- **카테고리 대시보드**: 카테고리별 카드와 최신 헤드라인 미리보기, 9개 단위 페이지네이션을 제공합니다.
- **카테고리 관리**: 추가, 이름 수정, 삭제를 지원합니다. 삭제하면 해당 기사는 "미분류"로 이동합니다.
- **NOTION저장**: 선택한 뉴스를 Notion MCP 서버를 통해 노션에 저장하고, 중복 저장을 막습니다.

## 기술 스택

| 영역 | 기술 |
|---|---|
| 프레임워크 | Next.js 16 (App Router), React 19, TypeScript |
| 스타일 | Tailwind CSS 4 |
| 인증 | Clerk |
| 데이터베이스 | Neon (Postgres) + Drizzle ORM |
| 요약·분류 | Claude API (`@anthropic-ai/sdk`) |
| 노션 저장 | Notion MCP 서버 (Claude API MCP 커넥터) |

## 시작하기

### 1. 설치

```bash
npm install
```

### 2. 환경변수

`.env.example`을 참고해 `.env.local`을 만들고 값을 채웁니다. `.env.local`은 커밋되지 않습니다.

| 변수 | 설명 |
|---|---|
| `DATABASE_URL` | Neon 연결 문자열 |
| `ANTHROPIC_API_KEY` | Claude API 키 |
| `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` | Clerk 키 |
| `NOTION_MCP_URL`, `NOTION_MCP_TOKEN` | Notion MCP 서버 주소와 토큰 |
| `NOTION_DATABASE_ID`, `NOTION_PARENT_ID` | 뉴스를 저장할 노션 위치 |

모든 키는 서버에서만 사용합니다. 클라이언트 코드에 노출하지 마세요.

### 3. 데이터베이스

```bash
npm run db:migrate   # 마이그레이션 적용
npm run db:seed      # 기본 카테고리 등록
```

기본 카테고리는 정치, 경제, 사회, 국제, IT/과학, 문화, 스포츠이며 "미분류"가 함께 쓰입니다.

### 4. 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 로그인한 뒤 `/dashboard`의 **뉴스 가져오기** 버튼을 누르세요.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` / `npm start` | 프로덕션 빌드 / 실행 |
| `npm run lint` | ESLint |
| `npm run db:generate` | 스키마 변경으로 마이그레이션 생성 |
| `npm run db:migrate` | 마이그레이션 적용 |
| `npm run db:seed` | 기본 카테고리 시드 |
| `npm run db:studio` | Drizzle Studio |

## 프로젝트 구조

```
src/
├─ app/
│  ├─ dashboard/          # 카테고리 대시보드, 카테고리별 뉴스 목록
│  └─ api/
│     ├─ news/fetch/      # 뉴스 가져오기
│     ├─ categories/      # 카테고리 CRUD
│     └─ articles/[id]/notion/  # 노션 저장
├─ components/            # 뉴스 카드, 카테고리 카드, 탭, 모달 등
├─ db/                    # Drizzle 스키마와 클라이언트
└─ lib/
   ├─ rss/                # RSS 소스, 수집, 파싱, 저장
   ├─ ai/                 # 요약·분류 프롬프트와 배치 처리
   └─ notion/             # 노션 저장
scripts/                  # 시드, 기사 재처리 스크립트
drizzle/                  # 마이그레이션
```

RSS 소스를 추가하려면 `src/lib/rss/sources.ts`에 한 줄을 더하면 됩니다.

## 문서

- `PRD.md`: 요구사항과 데이터 모델
- `ui.md`: UI 가이드 (디자인 토큰, 화면 구성)
