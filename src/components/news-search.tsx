"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

// 키워드 검색 폼. '검색' 버튼이나 Enter 로 ?q= 를 바꿔 이동한다. (페이지 번호는 1로 초기화)
export function NewsSearch({
  basePath,
  initialQuery,
}: {
  basePath: string;
  initialQuery: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(initialQuery);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const keyword = value.trim();
    router.push(
      keyword ? `${basePath}?q=${encodeURIComponent(keyword)}` : basePath,
    );
  }

  return (
    <form
      role="search"
      onSubmit={onSubmit}
      className="flex items-center gap-2"
    >
      <label htmlFor="news-search" className="sr-only">
        뉴스 키워드 검색
      </label>
      <input
        id="news-search"
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="키워드로 뉴스 검색"
        autoComplete="off"
        className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:placeholder:text-neutral-500"
      />
      <button
        type="submit"
        className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        검색
      </button>
      {initialQuery && (
        <Link
          href={basePath}
          className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          초기화
        </Link>
      )}
    </form>
  );
}
