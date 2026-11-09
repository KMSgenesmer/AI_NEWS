// 시드 스크립트: 기본 카테고리 + 예제 기사 5개 (여러 번 실행해도 안전)
//   npm run db:seed
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { articles, categories } from "../src/db/schema.ts";

try {
  process.loadEnvFile(".env.local");
} catch {
  // 시스템 환경변수 사용
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
}

const db = drizzle(neon(process.env.DATABASE_URL));

const defaultCategories = [
  { name: "정치", sortOrder: 1 },
  { name: "경제", sortOrder: 2 },
  { name: "사회", sortOrder: 3 },
  { name: "국제", sortOrder: 4 },
  { name: "IT/과학", sortOrder: 5 },
  { name: "문화", sortOrder: 6 },
  { name: "스포츠", sortOrder: 7 },
  { name: "미분류", sortOrder: 99 },
];

const sampleArticles = [
  {
    rank: 1,
    category: "경제",
    title: "내년 최저임금 심의 착수…노사 1만 1천 원 vs 1만 원 대치",
    summary:
      "최저임금위원회가 내년도 최저임금 심의를 시작했다. 노동계는 인상, 경영계는 동결 수준을 요구해 진통이 예상된다.",
    url: "https://example.com/news/1",
    press: "한빛일보",
    author: "정하준",
    publishedAt: new Date("2026-11-09T07:30:00+09:00"),
  },
  {
    rank: 2,
    category: "IT/과학",
    title: "국산 AI 반도체, 해외 데이터센터 첫 수주",
    summary:
      "국내 팹리스가 개발한 AI 반도체가 해외 데이터센터에 처음 공급된다. 전력 효율이 강점으로 꼽힌다.",
    url: "https://example.com/news/2",
    press: "새날뉴스",
    author: "오세린",
    publishedAt: new Date("2026-11-09T06:50:00+09:00"),
  },
  {
    rank: 3,
    category: "정치",
    title: "여야, 예산안 처리 시한 두고 정면충돌",
    summary:
      "여야가 예산안 처리 시한과 감액 범위를 놓고 대립했다. 본회의 일정은 확정되지 않았다.",
    url: "https://example.com/news/3",
    press: "대한시사",
    author: null,
    publishedAt: new Date("2026-11-09T08:10:00+09:00"),
  },
  {
    rank: 4,
    category: "사회",
    title: "수도권 광역버스 입석 금지 한 달…출근길 혼잡 여전",
    summary:
      "입석 금지 시행 한 달에도 출근 시간 혼잡이 계속된다. 지자체는 증차와 노선 조정을 검토 중이다.",
    url: "https://example.com/news/4",
    press: "한빛일보",
    author: "문가온",
    publishedAt: new Date("2026-11-08T21:40:00+09:00"),
    notionSaved: true,
    notionPageUrl: "https://www.notion.so/sample-page-4",
  },
  {
    rank: 5,
    category: "스포츠",
    title: "프로야구 한국시리즈 5차전 연장 접전 끝 우승 확정",
    summary:
      "연장 12회 접전 끝에 결승타로 우승이 확정됐다. 구단은 창단 이후 세 번째 우승이다.",
    url: "https://example.com/news/5",
    press: "오늘스포츠",
    author: "유다온",
    publishedAt: new Date("2026-11-08T23:15:00+09:00"),
  },
];

await db
  .insert(categories)
  .values(defaultCategories)
  .onConflictDoNothing({ target: categories.name });

const rows = await db.select().from(categories);
const idByName = new Map(rows.map((c) => [c.name, c.id]));

for (const { category, ...a } of sampleArticles) {
  const categoryId = idByName.get(category);
  if (!categoryId) throw new Error(`카테고리 없음: ${category}`);
  // url 중복이면 건너뛰되, 이미 있는 행에는 rank만 채워 준다.
  await db
    .insert(articles)
    .values({ ...a, categoryId })
    .onConflictDoUpdate({ target: articles.url, set: { rank: a.rank } });
}

const uncategorized = idByName.get("미분류")!;
console.log(
  `완료: 카테고리 ${rows.length}개, 예제 기사 ${sampleArticles.length}개 (미분류 id=${uncategorized})`,
);