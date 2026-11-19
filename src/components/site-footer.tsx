export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-neutral-400">
        <p>AI뉴스 모아보기</p>
        <p>뉴스 요약은 Claude가 생성하며, 원문은 각 언론사에 있습니다.</p>
      </div>
    </footer>
  );
}
