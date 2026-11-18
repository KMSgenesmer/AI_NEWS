import Link from "next/link";

import { getCategoryColor } from "@/lib/category-color";

export type CategoryTab = {
  id: number;
  name: string;
  count: number;
  color?: string | null;
};

const base =
  "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const active =
  "bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900";
const inactive =
  "text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800";

// selected: 카테고리 id, 또는 전체 보기이면 "all"
export function CategoryTabs({
  tabs,
  total,
  selected,
}: {
  tabs: CategoryTab[];
  total: number;
  selected: number | "all" | null;
}) {
  return (
    <nav aria-label="카테고리" className="flex gap-2 overflow-x-auto pb-1">
      <Link
        href="/dashboard/all"
        aria-current={selected === "all" ? "page" : undefined}
        className={`${base} ${selected === "all" ? active : inactive}`}
      >
        전체 {total}
      </Link>
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={`/dashboard/${tab.id}`}
          aria-current={selected === tab.id ? "page" : undefined}
          className={`${base} ${selected === tab.id ? active : inactive}`}
        >
          <span
            aria-hidden="true"
            className={`mr-2 inline-block size-2 rounded-full ${getCategoryColor(tab.name, tab.color).dot}`}
          />
          {tab.name} {tab.count}
        </Link>
      ))}
    </nav>
  );
}
