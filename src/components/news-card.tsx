import { DeleteNewsButton } from "@/components/delete-news-button";
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
  categoryColor?: string | null;
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
  const color = getCategoryColor(article.categoryName, article.categoryColor);
  const published = article.publishedAt;
  const meta = [article.press, article.author].filter(Boolean);

  return (
    // group: 카드 전체의 호버 상태를 제목·화살표·삭제 버튼에 전달한다.
    <article className="group relative flex h-full flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 transition duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_8px_24px_-12px_rgb(15_23_42/0.18)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:shadow-[0_8px_24px_-12px_rgb(0_0_0/0.6)]">
      <DeleteNewsButton id={article.id} title={article.title} />

      {showCategory && (
        <span
          className={`flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${color.badge}`}
        >
          <span
            aria-hidden="true"
            className={`size-1.5 rounded-full ${color.dot}`}
          />
          {article.categoryName}
        </span>
      )}

      <div className="flex flex-col gap-2">
        {/* 제목 링크를 카드 전체로 늘려(after:absolute) 카드 어디를 눌러도 원문이 열린다. */}
        <h2 className="line-clamp-2 pr-8 text-[17px] font-semibold leading-snug tracking-tight text-slate-900 transition-colors group-hover:text-indigo-700 dark:text-neutral-50 dark:group-hover:text-indigo-300">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded after:absolute after:inset-0 after:rounded-xl ${focusRing}`}
          >
            {article.title}
            <span className="sr-only"> (원문, 새 창에서 열림)</span>
          </a>
        </h2>

        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
          {article.summary}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-neutral-800">
        <p className="min-w-0 truncate text-xs text-slate-500 dark:text-neutral-400">
          {meta.map((m, i) => (
            <span key={i}>
              {i === 0 ? (
                <span className="font-medium text-slate-700 dark:text-neutral-200">
                  {m}
                </span>
              ) : (
                m
              )}
              {(i < meta.length - 1 || published) && (
                <span
                  aria-hidden="true"
                  className="mx-1.5 text-slate-300 dark:text-neutral-600"
                >
                  ·
                </span>
              )}
            </span>
          ))}
          {published && (
            <time dateTime={published.toISOString()}>
              {formatRelativeTime(published)}
            </time>
          )}
        </p>

        <div className="relative z-10 flex shrink-0 items-center gap-3">
          {/* 카드 전체가 링크이므로 장식용 힌트로만 둔다. 호버 시 화살표가 살짝 움직인다. */}
          <span
            aria-hidden="true"
            className="hidden text-xs font-medium text-slate-500 transition-colors group-hover:text-indigo-600 sm:inline dark:text-neutral-400 dark:group-hover:text-indigo-300"
          >
            원문
            <span className="ml-0.5 inline-block transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none">
              ↗
            </span>
          </span>

          {article.notionSaved ? (
            article.notionPageUrl ? (
              <a
                href={article.notionPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 ${focusRing}`}
              >
                ✓ 저장됨
                <span className="sr-only"> (노션 페이지 열기, 새 창)</span>
              </a>
            ) : (
              <span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ✓ 저장됨
              </span>
            )
          ) : (
            // 노션 저장 기능은 구현 단계 7에서 연결한다.
            <button
              type="button"
              disabled
              title="준비 중입니다"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 opacity-60 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
            >
              NOTION저장<span className="sr-only"> (준비 중)</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
