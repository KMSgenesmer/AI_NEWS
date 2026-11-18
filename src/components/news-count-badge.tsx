// 현재 수집된 뉴스 총 개수를 보여주는 배지 (표시용 컴포넌트)
export function NewsCountBadge({ count }: { count: number }) {
  return (
    <p
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 dark:bg-neutral-800 dark:text-neutral-200"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <path d="M4 5h13a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5Z" />
        <path d="M19 9h1a1 1 0 0 1 1 1v7a2 2 0 0 1-2 2" />
        <path d="M8 9h7M8 13h7" />
      </svg>
      <span>
        총 <span className="font-bold">{count.toLocaleString("ko-KR")}</span>개의
        뉴스
      </span>
    </p>
  );
}
