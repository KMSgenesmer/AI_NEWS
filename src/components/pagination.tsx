import Link from "next/link";

// 현재 페이지 주변만 번호를 보여주고 나머지는 "…"로 줄인다. (최대 7칸)
//   1 … 5 6 7 … 20
export function getPageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  let start = Math.max(2, current - 1);
  let end = Math.min(total - 1, current + 1);
  // 양 끝 근처에서는 칸 수가 일정하도록 범위를 넓힌다.
  if (current <= 4) {
    start = 2;
    end = 5;
  } else if (current >= total - 3) {
    start = total - 4;
    end = total - 1;
  }

  const items: (number | "…")[] = [1];
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

const item =
  "inline-flex min-w-10 items-center justify-center rounded-lg border px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const normal =
  "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800";
const active = "border-indigo-600 bg-indigo-600 text-white";
const disabled =
  "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-600";

// basePath 예: "/dashboard/all" → 2페이지는 "/dashboard/all?page=2", 1페이지는 쿼리 없음
export function Pagination({
  basePath,
  currentPage,
  totalPages,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const href = (page: number) =>
    page === 1 ? basePath : `${basePath}?page=${page}`;

  return (
    <nav
      aria-label="페이지 이동"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Link
          href={href(currentPage - 1)}
          rel="prev"
          aria-label="이전 페이지"
          className={`${item} ${normal}`}
        >
          ← 이전
        </Link>
      ) : (
        <span aria-disabled="true" className={`${item} ${disabled}`}>
          ← 이전
        </span>
      )}

      {getPageItems(currentPage, totalPages).map((p, i) =>
        p === "…" ? (
          <span
            key={`gap-${i}`}
            aria-hidden="true"
            className="px-1 text-slate-400 dark:text-neutral-500"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-label={`${p}페이지`}
            aria-current={p === currentPage ? "page" : undefined}
            className={`${item} ${p === currentPage ? active : normal}`}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link
          href={href(currentPage + 1)}
          rel="next"
          aria-label="다음 페이지"
          className={`${item} ${normal}`}
        >
          다음 →
        </Link>
      ) : (
        <span aria-disabled="true" className={`${item} ${disabled}`}>
          다음 →
        </span>
      )}
    </nav>
  );
}
