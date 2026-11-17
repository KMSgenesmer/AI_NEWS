import { eq } from "drizzle-orm";
import { db } from "@/db";
import { articles } from "@/db/schema";

// 로그인 확인은 src/proxy.ts 가 /api 전체에 대해 처리한다.
export async function DELETE(_request: Request, ctx: RouteContext<"/api/news/[id]">) {
  const { id } = await ctx.params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId) || articleId <= 0) {
    return Response.json({ error: "잘못된 뉴스 번호예요" }, { status: 400 });
  }

  try {
    const deleted = await db
      .delete(articles)
      .where(eq(articles.id, articleId))
      .returning({ id: articles.id });

    if (deleted.length === 0) {
      return Response.json({ error: "이미 삭제되었거나 없는 뉴스예요" }, { status: 404 });
    }
    return Response.json({ id: articleId });
  } catch (error) {
    console.error("뉴스 삭제 실패", error);
    return Response.json(
      { error: "뉴스를 삭제하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
