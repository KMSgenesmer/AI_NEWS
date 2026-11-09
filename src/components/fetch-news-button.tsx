// 뉴스 수집 기능(PRD 단계 4~6)이 연결되기 전까지는 자리만 잡아 둔 비활성 버튼이다.
export function FetchNewsButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      disabled
      title="준비 중입니다"
      aria-label="뉴스 가져오기 (준비 중)"
      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white opacity-50"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4"
      >
        <path d="M16 10a6 6 0 1 1-1.76-4.24M16 4v3.5h-3.5" />
      </svg>
      <span className={compact ? "hidden sm:inline" : undefined}>
        뉴스 가져오기
      </span>
    </button>
  );
}
