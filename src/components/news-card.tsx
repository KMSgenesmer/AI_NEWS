import { getCategoryColor } from "@/lib/category-color";
import { formatRelativeTime } from "@/lib/time";

export type NewsCardData = {
  id: number;
  title: string;
  summary: string;
  url: string;
  press: string | null;
  author: string | null;
  publishedAt: Date | null;
  categoryName: string;
  notionSaved: boolean;
  notionPageUrl: string | null;
};

export function NewsCard({ article }: { article: NewsCardData }) {
  const color = getCategoryColor(article.categoryName);
  const meta = [
    article.press,
    article.author,
    formatRelativeTime(article.publishedAt),
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <span
        className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${color.badge}`}
      >
        {article.categoryName}
      </span>

      <h2 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-neutral-100">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        >
          {article.title}
        </a>
      </h2>

      <p className="line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-neutral-400">
        {article.summary}
      </p>

      {meta.length > 0 && (
        <p className="text-xs text-slate-500 dark:text-neutral-400">
          {meta.join(" · ")}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-neutral-800">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded text-sm text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
        >
          원문 보기 ↗
        </a>

        {article.notionSaved ? (
          <a
            href={article.notionPageUrl ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-emerald-950 dark:text-emerald-300"
          >
            ✓ 저장됨
          </a>
        ) : (
          // 노션 저장 기능은 구현 단계 7에서 연결한다.
          <button
            type="button"
            disabled
            title="준비 중입니다"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            NOTION저장
          </button>
        )}
      </div>
    </article>
  );
}
