import Link from "next/link";

export type CategoryTab = { id: number; name: string; count: number };

const base =
  "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";
const active = "bg-indigo-600 text-white";
const inactive =
  "border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800";

// selected: 카테고리 id, 또는 전체 보기이면 "all"
export function CategoryTabs({
  tabs,
  total,
  selected,
}: {
  tabs: CategoryTab[];
  total: number;
  selected: number | "all";
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
          {tab.name} {tab.count}
        </Link>
      ))}
    </nav>
  );
}
