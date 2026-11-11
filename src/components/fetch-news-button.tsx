"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; added: number; failedSources: string[] }
  | { status: "error"; message: string };

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

export function FetchNewsButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<State>({ status: "idle" });

  // 성공 배너는 5초 뒤 자동으로 사라진다.
  useEffect(() => {
    if (state.status !== "success") return;
    const timer = setTimeout(() => setState({ status: "idle" }), 5000);
    return () => clearTimeout(timer);
  }, [state]);

  async function fetchNews() {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/news/fetch", { method: "POST" });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setState({
          status: "error",
          message: data?.error ?? "뉴스를 가져오지 못했어요.",
        });
        return;
      }
      setState({
        status: "success",
        added: data.added,
        failedSources: data.failedSources ?? [],
      });
      router.refresh();
    } catch {
      setState({
        status: "error",
        message: "네트워크 오류로 뉴스를 가져오지 못했어요.",
      });
    }
  }

  const loading = state.status === "loading";

  return (
    <>
      <button
        type="button"
        onClick={fetchNews}
        disabled={loading}
        aria-label={compact ? "뉴스 가져오기" : undefined}
        className={`inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 ${FOCUS_RING}`}
      >
        {loading ? (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        ) : (
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
        )}
        <span className={compact ? "hidden sm:inline" : undefined}>
          {loading ? "가져오는 중…" : "뉴스 가져오기"}
        </span>
      </button>

      {/* 진행/결과 배너: 헤더와 빈 화면 어디서 눌러도 같은 위치에 보인다. */}
      <div className="fixed inset-x-4 top-20 z-20 sm:left-auto sm:right-6 sm:max-w-sm">
        {loading && (
          <p
            role="status"
            className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-700 shadow-md dark:bg-indigo-950 dark:text-indigo-300"
          >
            뉴스를 가져오는 중이에요…
          </p>
        )}
        {state.status === "success" && (
          <p
            role="status"
            className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-md dark:bg-emerald-950 dark:text-emerald-300"
          >
            {state.added > 0
              ? `새 뉴스 ${state.added}건을 추가했어요`
              : "새로 추가된 뉴스가 없어요"}
            {state.failedSources.length > 0 &&
              ` (${state.failedSources.join(", ")}은(는) 가져오지 못했어요)`}
          </p>
        )}
        {state.status === "error" && (
          <div
            role="alert"
            className="flex items-center justify-between gap-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 shadow-md dark:bg-red-950 dark:text-red-300"
          >
            <span>{state.message}</span>
            <button
              type="button"
              onClick={fetchNews}
              className={`shrink-0 rounded font-medium underline ${FOCUS_RING}`}
            >
              다시 시도
            </button>
          </div>
        )}
      </div>
    </>
  );
}
