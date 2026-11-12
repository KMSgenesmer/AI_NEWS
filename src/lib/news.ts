import { count, desc, eq, lte, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";

export type CategoryWithCount = {
  id: number;
  name: string;
  color: string | null;
  count: number;
};

// 카테고리별 기사 수 (정렬 순서대로). 기사가 없는 "미분류"는 숨긴다.
export async function getCategoryCounts(): Promise<CategoryWithCount[]> {
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      color: categories.color,
      count: count(articles.id),
    })
    .from(categories)
    .leftJoin(articles, eq(articles.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder, categories.id);
  return rows.filter((c) => c.name !== "미분류" || c.count > 0);
}

// 최신순: 발행 시각이 없는 기사는 뒤로, 같으면 수집 시각 순. (page는 1부터 시작)
export async function getArticles(
  categoryId: number | null,
  page: number,
  pageSize: number,
) {
  return db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      url: articles.url,
      press: articles.press,
      author: articles.author,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      categoryColor: categories.color,
      notionSaved: articles.notionSaved,
      notionPageUrl: articles.notionPageUrl,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(categoryId === null ? undefined : eq(articles.categoryId, categoryId))
    .orderBy(
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
      desc(articles.id), // 페이지 사이에서 순서가 흔들리지 않도록 마지막 기준을 고정
    )
    .limit(pageSize)
    .offset((page - 1) * pageSize);
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

// 카테고리마다 최신 기사 N개 전체 (메인 화면의 카테고리별 섹션용)
export async function getLatestArticlesByCategory(perCategory = 6) {
  const ranked = db
    .select({
      id: articles.id,
      rn: sql<number>`row_number() over (partition by ${articles.categoryId} order by ${articles.publishedAt} desc nulls last, ${articles.fetchedAt} desc, ${articles.id} desc)`.as(
        "rn",
      ),
    })
    .from(articles)
    .as("ranked");

  const rows = await db
    .select({
      id: articles.id,
      categoryId: articles.categoryId,
      title: articles.title,
      summary: articles.summary,
      url: articles.url,
      press: articles.press,
      author: articles.author,
      publishedAt: articles.publishedAt,
      categoryName: categories.name,
      categoryColor: categories.color,
      notionSaved: articles.notionSaved,
      notionPageUrl: articles.notionPageUrl,
    })
    .from(ranked)
    .innerJoin(articles, eq(articles.id, ranked.id))
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(lte(ranked.rn, perCategory))
    .orderBy(
      articles.categoryId,
      sql`${articles.publishedAt} desc nulls last`,
      desc(articles.fetchedAt),
      desc(articles.id),
    );

  const byCategory = new Map<number, typeof rows>();
  for (const row of rows) {
    const list = byCategory.get(row.categoryId) ?? [];
    list.push(row);
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
