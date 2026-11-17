"use client";

import { useState } from "react";

type State =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; url: string | null }
  | { status: "error"; message: string };

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

export function NotionSaveButton({
  articleId,
  initialSaved,
  initialUrl,
}: {
  articleId: number;
  initialSaved: boolean;
  initialUrl: string | null;
}) {
  const [state, setState] = useState<State>(
    initialSaved ? { status: "saved", url: initialUrl } : { status: "idle" },
  );

  async function save() {
    // 저장 중·저장됨 상태에서는 다시 실행하지 않는다.
    if (state.status === "saving" || state.status === "saved") return;
    setState({ status: "saving" });
    try {
      const res = await fetch(`/api/articles/${articleId}/notion`, {
        method: "POST",
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setState({
          status: "error",
          message: data?.error ?? "노션에 저장하지 못했어요.",
        });
        return;
      }
      setState({ status: "saved", url: data?.notionPageUrl ?? null });
    } catch {
      setState({
        status: "error",
        message: "네트워크 오류로 저장하지 못했어요.",
      });
    }
  }

  const savedClass =
    "rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300";

  if (state.status === "saved") {
    return state.url ? (
      <a
        href={state.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`${savedClass} ${FOCUS_RING}`}
      >
        ✓ 저장됨
        <span className="sr-only"> (노션 페이지 열기, 새 창)</span>
      </a>
    ) : (
      <span className={savedClass}>✓ 저장됨</span>
    );
  }

  const saving = state.status === "saving";
  const failed = state.status === "error";

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className={`inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-sm font-medium hover:bg-slate-50 disabled:opacity-60 dark:bg-neutral-900 dark:hover:bg-neutral-800 ${
          failed
            ? "border-red-200 text-red-600 dark:border-red-900 dark:text-red-300"
            : "border-slate-200 text-slate-700 dark:border-neutral-700 dark:text-neutral-200"
        } ${FOCUS_RING}`}
      >
        {saving && (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
          />
        )}
        {saving ? "저장 중…" : failed ? "다시 시도" : "뉴스저장"}
      </button>
      <p role="status" aria-live="polite" className="sr-only">
        {saving ? "노션에 저장하는 중이에요" : ""}
      </p>
      {failed && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-300">
          {state.message}
        </p>
      )}
    </div>
  );
}
