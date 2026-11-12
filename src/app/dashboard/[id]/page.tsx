import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CategoryTabs } from "@/components/category-tabs";
import { EmptyCategoryState, EmptyNewsState } from "@/components/empty-state";
import { NewsCard } from "@/components/news-card";
import { Pagination } from "@/components/pagination";
import { SignedOutView } from "@/components/signed-out-view";
import { getArticles, getCategoryCounts } from "@/lib/news";
import { getCategoryColor } from "@/lib/category-color";

export const metadata = { title: "뉴스 목록 | AI뉴스 모아보기" };

const PAGE_SIZE = 9;

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/dashboard/[id]">) {
  const { userId } = await auth();
  if (!userId) return <SignedOutView />;

  const { id } = await params;
  const { page: rawPage } = await searchParams;

  // id는 카테고리 번호 또는 "all"(전체 보기)
  const categoryId = id === "all" ? null : Number(id);
  if (categoryId !== null && !Number.isInteger(categoryId)) notFound();

  const tabs = await getCategoryCounts();
  const total = tabs.reduce((sum, t) => sum + t.count, 0);
  const current = categoryId === null ? null : tabs.find((t) => t.id === categoryId);
  // 존재하지 않는 카테고리 번호
  if (categoryId !== null && !current) notFound();

  const totalCount = current ? current.count : total;
  const title = current ? current.name : "전체 뉴스";

  // ?page=N (1부터). 잘못된 값은 1페이지, 범위를 넘으면 마지막 페이지로 맞춘다.
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageValue = Number(Array.isArray(rawPage) ? rawPage[0] : rawPage);
  const page = Number.isInteger(pageValue)
    ? Math.min(Math.max(pageValue, 1), totalPages)
    : 1;
  const items = await getArticles(categoryId, page, PAGE_SIZE);

  return (
    <>
      <Link
        href="/dashboard"
        className="mb-4 inline-block rounded text-sm text-slate-500 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-neutral-400"
      >
        ← 전체 카테고리
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-lg font-semibold">
          {current && (
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-full ${getCategoryColor(current.name, current.color).dot}`}
            />
          )}
          {title}
        </h1>
        <p
          aria-live="polite"
          className="mt-1 text-sm text-slate-500 dark:text-neutral-400"
        >
          총 {totalCount}건 · 최신순
          {totalPages > 1 && ` · ${page} / ${totalPages} 페이지`}
        </p>
      </div>

      <div className="mb-6">
        <CategoryTabs tabs={tabs} total={total} selected={categoryId ?? "all"} />
      </div>

      {items.length === 0 ? (
        categoryId === null ? (
          <EmptyNewsState />
        ) : (
          <EmptyCategoryState />
        )
      ) : (
        <>
          <ul
            aria-label={`${title} 목록`}
            className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {items.map((article) => (
              <li key={article.id}>
                <NewsCard article={article} showCategory={categoryId === null} />
              </li>
            ))}
          </ul>

          <Pagination
            basePath={`/dashboard/${id}`}
            currentPage={page}
            totalPages={totalPages}
          />
        </>
      )}
    </>
  );
}
