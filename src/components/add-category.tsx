"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getColorByKey,
  SELECTABLE_COLOR_KEYS,
  type ColorKey,
} from "@/lib/category-color";

const COLOR_LABELS: Record<string, string> = {
  rose: "장미",
  amber: "호박",
  sky: "하늘",
  teal: "청록",
  indigo: "남색",
  violet: "보라",
  emerald: "초록",
};

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

// variant="card": 점선 카드 / "button": 헤더의 보조 버튼. 둘 다 같은 모달을 연다.
export function AddCategory({ variant }: { variant: "card" | "button" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "card" ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`flex h-full min-h-32 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 p-5 text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-neutral-700 dark:text-neutral-400 ${FOCUS_RING}`}
        >
          <span aria-hidden="true" className="text-2xl leading-none">
            ＋
          </span>
          <span className="text-sm font-medium">카테고리 추가</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 ${FOCUS_RING}`}
        >
          ＋ 카테고리 추가
        </button>
      )}
      {open && <AddCategoryModal onClose={() => setOpen(false)} />}
    </>
  );
}

function AddCategoryModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const titleId = useId();
  const errorId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [color, setColor] = useState<string>(SELECTABLE_COLOR_KEYS[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 열릴 때 입력창에 포커스, 닫히면 열었던 버튼으로 포커스를 돌려준다.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus();
  }, []);

  // Esc로 닫기 + Tab 포커스를 모달 안에 가둔다.
  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled])",
    );
    if (!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (saving) return;
    if (!name.trim()) {
      setError("이름을 입력해 주세요");
      return;
    }
    if (!slug.trim()) {
      setError("영문 ID를 입력해 주세요");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, color }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "카테고리를 추가하지 못했어요.");
        setSaving(false);
        return;
      }
      onClose();
      router.refresh();
    } catch {
      setError("네트워크 오류로 카테고리를 추가하지 못했어요.");
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
      >
        <form onSubmit={submit} noValidate>
          <h2 id={titleId} className="text-lg font-semibold">
            카테고리 추가
          </h2>
          <label className="mt-4 block text-sm text-slate-600 dark:text-neutral-400">
            카테고리 이름
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              maxLength={20}
              autoComplete="off"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
              className={`mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 ${FOCUS_RING}`}
            />
          </label>
          <label className="mt-4 block text-sm text-slate-600 dark:text-neutral-400">
            영문 ID (slug)
            <input
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setError(null);
              }}
              maxLength={30}
              placeholder="예: ai-news"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className={`mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 ${FOCUS_RING}`}
            />
            <span className="mt-1 block text-xs text-slate-500 dark:text-neutral-400">
              영문 소문자·숫자·하이픈(-)만 쓸 수 있어요.
            </span>
          </label>
          <fieldset className="mt-4">
            <legend className="text-sm text-slate-600 dark:text-neutral-400">
              색상
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {SELECTABLE_COLOR_KEYS.map((key) => (
                <label key={key} className="cursor-pointer">
                  <input
                    type="radio"
                    name="category-color"
                    value={key}
                    checked={color === key}
                    onChange={() => setColor(key)}
                    className="peer sr-only"
                  />
                  <span
                    className={`block size-8 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-500 dark:ring-offset-neutral-900 dark:peer-checked:ring-neutral-100 ${getColorByKey(key as ColorKey).dot}`}
                  />
                  <span className="sr-only">{COLOR_LABELS[key] ?? key}</span>
                </label>
              ))}
            </div>
          </fieldset>
          {error && (
            <p
              id={errorId}
              role="alert"
              className="mt-1.5 text-xs text-red-600 dark:text-red-300"
            >
              {error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 ${FOCUS_RING}`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60 ${FOCUS_RING}`}
            >
              {saving ? "추가하는 중…" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
