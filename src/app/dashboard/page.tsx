import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AddCategory } from "@/components/add-category";
import { CategoryTabs } from "@/components/category-tabs";
import { EmptyNewsState } from "@/components/empty-state";
import { NewsCard } from "@/components/news-card";
import { NewsCountBadge } from "@/components/news-count-badge";
import { SignedOutView } from "@/components/signed-out-view";
import { getCategoryColor } from "@/lib/category-color";
import {
  countArticles,
  getCategoryCounts,
  getLastFetchedAt,
  getLatestArticlesByCategory,
} from "@/lib/news";
import { formatRelativeTime } from "@/lib/time";

export const metadata = { title: "대시보드 | AI뉴스 모아보기" };

// 카테고리마다 메인에 보여줄 최대 기사 수. 나머지는 "더 보기"로 카테고리 화면에서 본다.
const PER_CATEGORY = 6;

export default async function DashboardPage() {
  const { userId } = await auth();
  // 페이지는 미들웨어에서 막지 않으므로, 로그인하지 않았으면 DB를 조회하지 않는다. (PRD 5.1)
  if (!userId) return <SignedOutView />;

  const [categories, articlesByCategory, lastFetchedAt, totalCount] =
    await Promise.all([
      getCategoryCounts(),
      getLatestArticlesByCategory(PER_CATEGORY),
      getLastFetchedAt(),
      countArticles(null), // DB에 저장된 전체 뉴스 수
    ]);
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  // 사용자가 방금 추가한 빈 카테고리도 보여야 하므로 기사 수와 상관없이 모두 섹션으로 둔다.
  // ("미분류"는 getCategoryCounts에서 기사가 0건이면 이미 빠진다.)
  const sections = categories;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">오늘의 뉴스</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
            <NewsCountBadge count={totalCount} />
            <span className="text-sm text-slate-500 dark:text-neutral-400">
              {sections.length}개 카테고리
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 text-sm">
          <AddCategory variant="button" />
          <span className="text-xs text-slate-500 dark:text-neutral-400">
            {lastFetchedAt
              ? `마지막 수집: ${formatRelativeTime(lastFetchedAt)}`
              : "아직 수집한 적이 없어요"}
          </span>
          {total > 0 && (
            <Link
              href="/dashboard/all"
              className="rounded text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
            >
              전체 뉴스 보기 →
            </Link>
          )}
        </div>
      </div>

      {total > 0 && (
        <div className="mb-8">
          {/* 카테고리 필터: 누르면 해당 카테고리의 뉴스 목록으로 이동한다. */}
          <CategoryTabs tabs={categories} total={total} selected={null} />
        </div>
      )}

      {total === 0 ? (
        <EmptyNewsState />
      ) : (
        <div className="flex flex-col gap-10">
          {sections.map((category) => {
            const items = articlesByCategory.get(category.id) ?? [];
            const color = getCategoryColor(category.name, category.color);
            return (
              <section key={category.id} aria-labelledby={`cat-${category.id}`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2
                    id={`cat-${category.id}`}
                    className="flex items-center gap-2 text-base font-semibold"
                  >
                    <span
                      aria-hidden="true"
                      className={`size-2.5 rounded-full ${color.dot}`}
                    />
                    {category.name}
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-normal text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
                      {category.count}
                    </span>
                  </h2>
                  <Link
                    href={`/dashboard/${category.id}`}
                    className="rounded text-sm font-medium text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
                  >
                    {category.count > items.length
                      ? `${category.name} 더 보기 →`
                      : `${category.name} 보기 →`}
                  </Link>
                </div>
                {items.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-300 px-5 py-8 text-center text-sm text-slate-400 dark:border-neutral-700 dark:text-neutral-500">
                    이 카테고리에는 아직 뉴스가 없어요
                  </p>
                ) : (
                  <ul
                    aria-label={`${category.name} 뉴스`}
                    className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
                  >
                    {items.map((article) => (
                      <li key={article.id}>
                        <NewsCard article={article} showCategory={false} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
          <div className="max-w-sm">
            <AddCategory variant="card" />
          </div>
        </div>
      )}
    </>
  );
}
