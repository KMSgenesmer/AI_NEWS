import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import type { SourceItem } from "./fetch-feeds";

const UNCATEGORIZED = "미분류";

async function getUncategorizedId(): Promise<number> {
  const find = () =>
    db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.name, UNCATEGORIZED))
      .limit(1);

  const [existing] = await find();
  if (existing) return existing.id;

  // 시드를 돌리지 않은 환경 대비: 없으면 만든다.
  await db
    .insert(categories)
    .values({ name: UNCATEGORIZED, sortOrder: 99 })
    .onConflictDoNothing({ target: categories.name });
  const [created] = await find();
  return created.id;
}

// 기사를 저장하고 새로 추가된 건수를 돌려준다.
// URL이 이미 있는 기사는 건너뛴다 (articles.url unique + ON CONFLICT DO NOTHING).
// 카테고리 분류와 한국어 요약은 이후 Claude 단계에서 채우므로, 지금은
// "미분류" + 원문 요약으로 임시 저장한다.
export async function saveArticles(items: SourceItem[]): Promise<number> {
  // 같은 URL이 한 번에 여러 소스/항목에서 들어와도 하나만 남긴다.
  const unique = [...new Map(items.map((item) => [item.url, item])).values()];
  if (unique.length === 0) return 0;

  const categoryId = await getUncategorizedId();
  const inserted = await db
    .insert(articles)
    .values(
      unique.map((item) => ({
        title: item.title,
        // summary는 NOT NULL이라 설명이 비어 있으면 제목으로 대신한다.
        summary: item.summary || item.title,
        url: item.url,
        press: item.press,
        author: item.author,
        publishedAt: item.publishedAt,
        categoryId,
      })),
    )
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return inserted.length;
}
