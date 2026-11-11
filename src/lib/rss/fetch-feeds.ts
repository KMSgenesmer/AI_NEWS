import {
  fetchNaverNews,
  MissingConfigError,
  NAVER_SOURCE_NAME,
} from "./naver-news";
import { parseFeed, type SourceItem } from "./parse-feed";
import {
  FEED_SOURCES,
  FEED_TIMEOUT_MS,
  FETCH_WINDOW_MS,
  type FeedSource,
} from "./sources";

export type { SourceItem };

export type FetchFeedsResult = {
  items: SourceItem[];
  failedSources: string[];
  /** failedSources 중 API 키 등 설정이 없어서 실패한 소스 */
  missingConfig: string[];
  totalSources: number;
};

async function fetchSource(source: FeedSource, since: Date): Promise<SourceItem[]> {
  const res = await fetch(source.url, {
    headers: {
      "User-Agent": "AI-News-Reader/1.0",
      Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`${source.name} 응답 오류 (${res.status})`);

  return (
    parseFeed(await res.text())
      // 지난 24시간 이내 기사만. 발행 시각이 없는 항목은 판단할 수 없어 제외한다.
      .filter((item) => item.publishedAt && item.publishedAt >= since)
      .map((item) => ({ ...item, press: source.name }))
  );
}

// RSS 소스 + 네이버 뉴스(검색 API)를 병렬 수집한다.
// 한 소스가 실패해도 나머지는 그대로 사용한다.
export async function fetchFeeds(now = new Date()): Promise<FetchFeedsResult> {
  const since = new Date(now.getTime() - FETCH_WINDOW_MS);
  const tasks: { name: string; run: Promise<SourceItem[]> }[] = [
    ...FEED_SOURCES.map((s) => ({ name: s.name, run: fetchSource(s, since) })),
    { name: NAVER_SOURCE_NAME, run: fetchNaverNews(since) },
  ];
  const results = await Promise.allSettled(tasks.map((t) => t.run));

  const items: SourceItem[] = [];
  const failedSources: string[] = [];
  const missingConfig: string[] = [];
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      failedSources.push(tasks[i].name);
      if (result.reason instanceof MissingConfigError) {
        missingConfig.push(tasks[i].name);
      }
      console.warn(`[뉴스 수집] ${tasks[i].name} 실패:`, result.reason);
    }
  });
  return { items, failedSources, missingConfig, totalSources: tasks.length };
}
