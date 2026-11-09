import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { FetchNewsButton } from "@/components/fetch-news-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="rounded text-xl font-bold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span aria-hidden="true">📰 </span>AI뉴스 모아보기
        </Link>
        <div className="flex items-center gap-3">
          <FetchNewsButton compact />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
