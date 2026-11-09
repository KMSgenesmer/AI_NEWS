import { count, desc, eq, lte, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export type CategoryWithCount = { id: number; name: string; count: number };

// 카테고리별 기사 수 (정렬 순서대로). 기사가 없는 "미분류"는 숨긴다.
export async function getCategoryCounts(): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      count: count(articles.id),
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder, categories.id);
  return rows.filter((c) => c.name !== "미분류" || c.count > 0);
}

// 최신순: 발행 시각이 없는 기사는 뒤로, 같으면 수집 시각 순.
// limit + 1건을 가져와 "더 있는지"를 함께 알려준다.
export async function getArticles(categoryId: number | null, limit: number) {
  const rows = await db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      url: articles.url,
      press: articles.press,
      author: articles.author,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      notionSaved: articles.notionSaved,
      notionPageUrl: articles.notionPageUrl,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(categoryId === null ? undefined : eq(articles.categoryId, categoryId))
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
    )
    .limit(limit + 1);
  return { items: rows.slice(0, limit), hasMore: rows.length > limit };
}

// 카테고리마다 최신 기사 제목 N개 (대시보드 카드 미리보기용)
export async function getLatestHeadlines(perCategory = 3) {
  const ranked = db
    .select({
      categoryId: articles.categoryId,
      title: articles.title,
      rn: sql<number>`row_number() over (partition by ${articles.categoryId} order by ${articles.publishedAt} desc nulls last, ${articles.fetchedAt} desc)`.as(
        "rn",
      ),
    })
    .from(articles)
    .as("ranked");

  const rows = await db
    .select({ categoryId: ranked.categoryId, title: ranked.title })
    .from(ranked)
    .where(lte(ranked.rn, perCategory))
    .orderBy(ranked.categoryId, ranked.rn);

  const byCategory = new Map<number, string[]>();
  for (const row of rows) {
    const list = byCategory.get(row.categoryId) ?? [];
    list.push(row.title);
    byCategory.set(row.categoryId, list);
  }
  return byCategory;
}

export async function getLastFetchedAt(): Promise<Date | null> {
  const [row] = await db
    .select({ value: max(articles.fetchedAt) })
    .from(articles);
  return row?.value ? new Date(row.value) : null;
}
