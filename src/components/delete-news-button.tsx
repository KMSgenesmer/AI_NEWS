"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DeleteNewsButton({ id, title }: { id: number; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setPending(true);
    setError("");
    try {
      const res = await fetch(`/api/news/${id}`, { method: "DELETE" });
      // 404는 이미 삭제된 경우이므로 목록만 새로고침한다.
      if (!res.ok && res.status !== 404) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "삭제하지 못했어요");
        setPending(false);
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류로 삭제하지 못했어요");
      setPending(false);
    }
  }

  return (
    <div className="absolute right-2 top-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        aria-label={`'${title}' 뉴스 삭제`}
        title="삭제"
        className="flex size-8 items-center justify-center rounded-full text-lg leading-none text-slate-500 hover:bg-slate-100 hover:text-red-600 disabled:opacity-60 dark:text-neutral-400 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {pending ? (
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600"
          />
        ) : (
          <span aria-hidden="true">✕</span>
        )}
      </button>
      {error && (
        <p
          role="alert"
          className="absolute right-0 top-9 z-10 w-40 rounded-lg bg-red-50 p-2 text-xs text-red-600 shadow dark:bg-red-950 dark:text-red-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}
