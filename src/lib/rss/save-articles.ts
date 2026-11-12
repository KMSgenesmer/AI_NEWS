import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { enrichArticles } from "@/lib/ai/enrich-articles";
import { guessCategory } from "@/lib/ai/keyword-category";
import { UNCATEGORIZED } from "@/lib/ai/prompt";
import type { SourceItem } from "./fetch-feeds";

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

export type SaveResult = {
  /** 새로 저장된 건수 */
  added: number;
  /** 그중 Claude 처리에 실패해 원문/미분류로 저장된 건수 */
  failedEnrich: number;
};

// 새 기사만 Claude로 번역·요약·분류한 뒤 저장한다.
// - URL이 이미 있는 기사는 Claude 호출 전에 걸러 비용을 쓰지 않는다.
// - Claude 처리가 실패한 기사는 원문 제목/설명 + "미분류"로 저장한다.
export async function saveArticles(items: SourceItem[]): Promise<SaveResult> {
  // 같은 URL이 한 번에 여러 소스/항목에서 들어와도 하나만 남긴다.
  const unique = [...new Map(items.map((item) => [item.url, item])).values()];
  if (unique.length === 0) return { added: 0, failedEnrich: 0 };

  const existing = await db
    .select({ url: articles.url })
    .from(articles)
    .where(inArray(articles.url, unique.map((i) => i.url)));
  const known = new Set(existing.map((e) => e.url));
  const fresh = unique.filter((i) => !known.has(i.url));
  if (fresh.length === 0) return { added: 0, failedEnrich: 0 };

  const uncategorizedId = await getUncategorizedId();
  const categoryRows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories);
  const idByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  const enriched = await enrichArticles(
    fresh,
    categoryRows.map((c) => c.name),
  );

  const inserted = await db
    .insert(articles)
    .values(
      fresh.map((item, index) => {
        const result = enriched.get(index);
        return {
          title: result?.titleKo ?? item.title,
          titleOriginal: item.title,
          // summary는 NOT NULL이라 설명이 비어 있으면 제목으로 대신한다.
          summary: result?.summaryKo ?? (item.summary || item.title),
          url: item.url,
          press: item.press,
          author: item.author,
          publishedAt: item.publishedAt,
          // Claude 결과가 없으면 키워드로 임시 분류한다. (번역·요약은 원문 그대로)
          categoryId:
            idByName.get(
              result?.category ??
                guessCategory(item.title, item.summary, [...idByName.keys()]),
            ) ?? uncategorizedId,
        };
      }),
    )
    .onConflictDoNothing({ target: articles.url })
    .returning({ id: articles.id });

  return {
    added: inserted.length,
    failedEnrich: fresh.length - enriched.size,
  };
}
