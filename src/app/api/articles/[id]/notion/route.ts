import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import {
  NotionConfigError,
  saveArticleToNotion,
} from "@/lib/notion/save-to-notion";

// 로그인 확인은 src/proxy.ts 가 /api 전체에 대해 처리한다.
export const maxDuration = 60;

export async function POST(
  _req: Request,
  ctx: RouteContext<"/api/articles/[id]/notion">,
) {
  const { id: rawId } = await ctx.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "잘못된 요청이에요." }, { status: 400 });
  }

  const [article] = await db
    .select({
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
    .where(eq(articles.id, id));

  if (!article) {
    return Response.json({ error: "기사를 찾을 수 없어요." }, { status: 404 });
  }

  // 중복 저장 방지: 이미 저장된 기사는 다시 만들지 않고 기존 주소를 돌려준다.
  if (article.notionSaved) {
    return Response.json({ notionPageUrl: article.notionPageUrl });
  }

  try {
    const notionPageUrl = await saveArticleToNotion(article);
    await db
      .update(articles)
      .set({ notionSaved: true, notionPageUrl })
      .where(eq(articles.id, id));
    return Response.json({ notionPageUrl });
  } catch (error) {
    console.error("노션 저장 실패", error);
    const message =
      error instanceof NotionConfigError
        ? error.message
        : "노션에 저장하지 못했어요. 잠시 후 다시 시도해 주세요.";
    return Response.json({ error: message }, { status: 500 });
  }
}
