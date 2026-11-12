// 아직 AI 처리가 안 된 기사(제목이 원문 그대로이고 "미분류")를 번역·요약·분류해 갱신한다.
//
//   npx tsx --env-file=.env.local scripts/reprocess-articles.ts          # 대상 건수만 확인 (API 호출 없음)
//   npx tsx --env-file=.env.local scripts/reprocess-articles.ts --apply  # 실제 Claude 호출 + DB 갱신 (유료)
//
// - 이미 처리된 기사(제목이 번역됐거나 카테고리가 정해진 기사)는 건드리지 않는다.
// - 기사를 삭제하지 않고, 처리에 성공한 기사만 UPDATE 한다. 실패한 기사는 그대로 둔다.
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { guessCategory } from "@/lib/ai/keyword-category";
import { enrichArticles } from "@/lib/ai/enrich-articles";
import { UNCATEGORIZED } from "@/lib/ai/prompt";

async function main() {
  const apply = process.argv.includes("--apply");
  // --keywords: API 없이 "미분류" 기사만 키워드로 임시 분류
  const keywords = process.argv.includes("--keywords");

  const targets = await db
    .select({
      id: articles.id,
      title: articles.title,
      summary: articles.summary,
      url: articles.url,
      press: articles.press,
      author: articles.author,
      publishedAt: articles.publishedAt,
    })
    .from(articles)
    .innerJoin(categories, eq(articles.categoryId, categories.id))
    .where(
      keywords
        ? eq(categories.name, UNCATEGORIZED)
        : sql`${articles.title} = ${articles.titleOriginal}`,
    );

  if (keywords) {
    const rows = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories);
    const ids = new Map(rows.map((c) => [c.name, c.id]));
    const names = rows.map((c) => c.name);
    let moved = 0;
    for (const t of targets) {
      const id = ids.get(guessCategory(t.title, t.summary, names));
      if (!id || id === ids.get(UNCATEGORIZED)) continue;
      await db.update(articles).set({ categoryId: id }).where(eq(articles.id, t.id));
      moved++;
    }
    console.log(`키워드 분류: ${moved}건 이동 (제목·요약은 그대로, 삭제 없음)`);
    return;
  }

  const batches = Math.ceil(targets.length / 10);
  console.log(`처리 대상: ${targets.length}건 (예상 API 호출 ${batches}회)`);
  if (!apply) {
    console.log("--apply 없이 실행해서 API를 호출하지 않았어요.");
    return;
  }
  if (targets.length === 0) return;

  const categoryRows = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories);
  const idByName = new Map(categoryRows.map((c) => [c.name, c.id]));

  const items = targets.map((t) => ({
    title: t.title,
    summary: t.summary,
    url: t.url,
    press: t.press ?? "",
    author: t.author,
    publishedAt: t.publishedAt,
  }));
  const enriched = await enrichArticles(items, categoryRows.map((c) => c.name));

  let updated = 0;
  for (const [index, result] of enriched) {
    const categoryId = idByName.get(result.category);
    if (!categoryId) continue;
    await db
      .update(articles)
      .set({
        title: result.titleKo,
        summary: result.summaryKo,
        categoryId,
      })
      .where(eq(articles.id, targets[index].id));
    updated++;
  }
  console.log(`갱신 ${updated}건 / 실패 ${targets.length - updated}건`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("실패:", error?.message ?? error);
    process.exit(1);
  });
