import Link from "next/link";
import { FetchNewsButton } from "@/components/fetch-news-button";

// 전체 뉴스가 비어 있을 때(첫 방문): 안내 문구 + 뉴스 가져오기 버튼
export function EmptyNewsState() {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 px-6 py-20 text-center dark:border-neutral-700"
    >
      <div
        aria-hidden="true"
        className="flex size-16 items-center justify-center rounded-full bg-indigo-50 text-3xl dark:bg-indigo-950"
      >
        📰
      </div>
      <div>
        <p className="text-lg font-semibold">아직 가져온 뉴스가 없어요</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-neutral-400">
          뉴스를 가져오면 카테고리별로 요약해 보여드려요.
        </p>
      </div>
      <FetchNewsButton />
    </div>
  );
}

// 특정 카테고리에 기사가 없을 때
export function EmptyCategoryState() {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-6 py-16 text-center dark:border-neutral-700"
    >
      <p className="font-semibold">이 카테고리에는 아직 뉴스가 없어요</p>
      <Link
        href="/dashboard"
        className="rounded text-sm text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
      >
        ← 전체 카테고리로 돌아가기
      </Link>
    </div>
  );
}
