/** 뉴스 카드와 같은 모양의 로딩 자리표시자 (ui.md §3.6 스켈레톤) */
export function NewsCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div
      aria-hidden="true"
      style={{ animationDelay: `${delay}ms` }}
      className="flex h-full animate-pulse flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6 motion-reduce:animate-none dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* 카테고리 배지: 색 점 + 이름 */}
      <div className="flex items-center gap-2">
        <div className="size-2 rounded-full bg-indigo-200 dark:bg-indigo-900" />
        <div className="h-5 w-14 rounded-full bg-indigo-100 dark:bg-indigo-950" />
      </div>

      {/* 제목 2줄 */}
      <div className="space-y-2">
        <div className="h-4 w-11/12 rounded-md bg-slate-200 dark:bg-neutral-800" />
        <div className="h-4 w-2/3 rounded-md bg-slate-200 dark:bg-neutral-800" />
      </div>

      {/* 요약 4줄 */}
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-slate-100 dark:bg-neutral-800/70" />
        <div className="h-3 w-full rounded bg-slate-100 dark:bg-neutral-800/70" />
        <div className="h-3 w-11/12 rounded bg-slate-100 dark:bg-neutral-800/70" />
        <div className="h-3 w-3/5 rounded bg-slate-100 dark:bg-neutral-800/70" />
      </div>

      {/* 메타: 언론사 아이콘 + 텍스트 */}
      <div className="flex items-center gap-2">
        <div className="size-4 rounded-full bg-slate-200 dark:bg-neutral-800" />
        <div className="h-3 w-2/5 rounded bg-slate-100 dark:bg-neutral-800/70" />
      </div>

      {/* 액션 바 */}
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-neutral-800">
        <div className="h-4 w-16 rounded bg-slate-100 dark:bg-neutral-800/70" />
        <div className="h-10 w-24 rounded-lg bg-slate-200 dark:bg-neutral-800" />
      </div>
    </div>
  );
}

export function NewsCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">뉴스를 불러오는 중이에요…</span>
      <ul aria-hidden="true" className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <li key={i}>
            <NewsCardSkeleton delay={i * 120} />
          </li>
        ))}
      </ul>
    </div>
  );
}
