import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { AddCategoryCard, CategoryCard } from "@/components/category-card";
import { EmptyNewsState } from "@/components/empty-state";
import { SignedOutView } from "@/components/signed-out-view";
import {
  getCategoryCounts,
  getLastFetchedAt,
  getLatestHeadlines,
} from "@/lib/news";
import { formatRelativeTime } from "@/lib/time";

export const metadata = { title: "대시보드 | AI뉴스 모아보기" };

export default async function DashboardPage() {
  const { userId } = await auth();
  // 페이지는 미들웨어에서 막지 않으므로, 로그인하지 않았으면 DB를 조회하지 않는다. (PRD 5.1)
  if (!userId) return <SignedOutView />;

  const [categories, headlines, lastFetchedAt] = await Promise.all([
    getCategoryCounts(),
    getLatestHeadlines(3),
    getLastFetchedAt(),
  ]);
  const total = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">오늘의 뉴스</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
            총 {total}건 · {categories.length}개 카테고리
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 text-sm">
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

      {total === 0 ? (
        <EmptyNewsState />
      ) : (
        <ul
          aria-label="카테고리 목록"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {categories.map((category) => (
            <li key={category.id}>
              <CategoryCard
                id={category.id}
                name={category.name}
                count={category.count}
                headlines={headlines.get(category.id) ?? []}
              />
            </li>
          ))}
          <li>
            <AddCategoryCard />
          </li>
        </ul>
      )}
    </>
  );
}
