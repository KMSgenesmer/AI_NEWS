import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { FetchNewsButton } from "@/components/fetch-news-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          <span
            aria-hidden="true"
            className="flex size-7 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M4 5h13a2 2 0 0 1 2 2v12H6a2 2 0 0 1-2-2V5Z" />
              <path d="M8 9h7M8 13h7" />
            </svg>
          </span>
          AI뉴스 모아보기
        </Link>
        <div className="flex items-center gap-3">
          <FetchNewsButton compact />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
