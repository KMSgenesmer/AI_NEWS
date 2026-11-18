import Link from "next/link";
import { getCategoryColor } from "@/lib/category-color";

export function CategoryCard({
  id,
  name,
  count,
  headlines,
}: {
  id: number;
  name: string;
  count: number;
  headlines: string[];
}) {
  const color = getCategoryColor(name);

  return (
    <Link
      href={`/dashboard/${id}`}
      aria-label={`${name}, 뉴스 ${count}건 보기`}
      className="flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-600"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 font-semibold">
          <span
            aria-hidden="true"
            className={`size-2.5 rounded-full ${color.dot}`}
          />
          {name}
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600 dark:bg-neutral-800 dark:text-neutral-300">
          {count}
        </span>
      </div>

      {headlines.length > 0 ? (
        <ul className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-neutral-400">
          {headlines.map((title, i) => (
            <li key={i} className="truncate">
              · {title}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-400 dark:text-neutral-500">
          아직 뉴스가 없어요
        </p>
      )}

      <span
        aria-hidden="true"
        className="mt-auto text-right text-sm font-medium text-indigo-600 dark:text-indigo-400"
      >
        보기 →
      </span>
    </Link>
  );
}

// 카테고리 추가 기능(PRD 단계 3)이 연결되기 전까지는 자리만 잡아 둔 비활성 카드이다.
export function AddCategoryCard() {
  return (
    <button
      type="button"
      disabled
      title="준비 중입니다"
      aria-label="카테고리 추가 (준비 중)"
      className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-5 text-slate-500 opacity-70 dark:border-neutral-700 dark:text-neutral-400"
    >
      <span aria-hidden="true" className="text-2xl leading-none">
        ＋
      </span>
      <span className="text-sm font-medium">카테고리 추가</span>
      <span className="text-xs">준비 중</span>
    </button>
  );
}
