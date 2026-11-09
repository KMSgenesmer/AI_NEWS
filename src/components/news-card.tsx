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

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500";

export function NewsCard({
  article,
  showCategory = true,
}: {
  article: NewsCardData;
  showCategory?: boolean;
}) {
  const color = getCategoryColor(article.categoryName);
  const published = article.publishedAt;

  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      {showCategory && (
        <span
          className={`w-fit rounded-full px-2.5 py-0.5 text-xs font-medium ${color.badge}`}
        >
          {article.categoryName}
        </span>
      )}

      <h2 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 dark:text-neutral-100">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`rounded hover:underline ${focusRing}`}
        >
          {article.title}
          <span className="sr-only"> (원문, 새 창에서 열림)</span>
        </a>
      </h2>

      <p className="line-clamp-4 text-sm leading-relaxed text-slate-600 dark:text-neutral-400">
        {article.summary}
      </p>

      <p className="text-xs text-slate-500 dark:text-neutral-400">
        {[article.press, article.author].filter(Boolean).join(" · ")}
        {(article.press || article.author) && published && " · "}
        {published && (
          <time dateTime={published.toISOString()}>
            {formatRelativeTime(published)}
          </time>
        )}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3 dark:border-neutral-800">
        {/* 제목 링크와 같은 주소이므로 스크린리더·키보드 이동에서는 건너뛴다. */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-hidden="true"
          tabIndex={-1}
          className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
        >
          원문 보기 ↗
        </a>

        {article.notionSaved ? (
          article.notionPageUrl ? (
            <a
              href={article.notionPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 ${focusRing}`}
            >
              ✓ 저장됨
              <span className="sr-only"> (노션 페이지 열기, 새 창)</span>
            </a>
          ) : (
            <span className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ 저장됨
            </span>
          )
        ) : (
          // 노션 저장 기능은 구현 단계 7에서 연결한다.
          <button
            type="button"
            disabled
            title="준비 중입니다"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            NOTION저장<span className="sr-only"> (준비 중)</span>
          </button>
        )}
      </div>
    </article>
  );
}
