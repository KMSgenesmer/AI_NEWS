import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import { count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { articles, categories } from "@/db/schema";
import { CategoryTabs } from "@/components/category-tabs";
import { NewsCard } from "@/components/news-card";
import { SignInModal } from "@/components/sign-in-modal";

export const metadata = { title: "대시보드 | AI뉴스 모아보기" };

const ARTICLE_LIMIT = 100;

export default async function DashboardPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const { userId } = await auth();

  // 페이지는 미들웨어에서 막지 않으므로, 로그인하지 않았으면 DB를 조회하지 않는다. (PRD 5.1)
  if (!userId) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-slate-50 p-8 text-center dark:bg-neutral-950">
        <h1 className="text-3xl font-bold tracking-tight">AI뉴스 모아보기</h1>
        <p className="text-slate-500 dark:text-neutral-400">
          로그인 후 이용할 수 있습니다.
        </p>
        <SignInModal />
      </main>
    );
  }

  const { category } = await searchParams;
  const rawId = Array.isArray(category) ? category[0] : category;
  const parsedId = rawId ? Number(rawId) : NaN;
  const selectedId = Number.isInteger(parsedId) ? parsedId : null;

  const [tabRows, articleRows] = await Promise.all([
    db
      .select({
        id: categories.id,
        name: categories.name,
        count: count(articles.id),
      })
      .from(categories)
      .leftJoin(articles, eq(articles.categoryId, categories.id))
      .groupBy(categories.id)
      .orderBy(categories.sortOrder, categories.id),
    db
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
      .where(selectedId === null ? undefined : eq(articles.categoryId, selectedId))
      // 최신순: 발행 시각이 없는 기사는 뒤로, 같으면 수집 시각 순
      .orderBy(sql`${articles.publishedAt} desc nulls last`, desc(articles.fetchedAt))
      .limit(ARTICLE_LIMIT),
  ]);

  // 기사가 없는 "미분류"는 탭에서 숨긴다.
  const tabs = tabRows.filter((t) => t.name !== "미분류" || t.count > 0);
  const total = tabRows.reduce((sum, t) => sum + t.count, 0);
  const selected = tabs.find((t) => t.id === selectedId);

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-slate-50 text-slate-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-xl font-bold tracking-tight">
            📰 AI뉴스 모아보기
          </span>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-lg font-semibold">
            {selected ? selected.name : "오늘의 뉴스"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
            {selected ? `${selected.count}건` : `총 ${total}건`} · 최신순
          </p>
        </div>

        <div className="mb-6">
          <CategoryTabs tabs={tabs} total={total} selectedId={selectedId} />
        </div>

        {articleRows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 py-20 text-center text-slate-500 dark:border-neutral-700 dark:text-neutral-400">
            {selectedId === null
              ? "아직 가져온 뉴스가 없어요"
              : "이 카테고리에는 아직 뉴스가 없어요"}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {articleRows.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
