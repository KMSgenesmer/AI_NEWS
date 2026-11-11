// 수집할 RSS 소스 목록. 소스를 추가하려면 여기에 한 줄만 더하면 된다.
export type FeedSource = {
  /** articles.press 에 저장되는 이름 */
  name: string;
  url: string;
};

export const FEED_SOURCES: readonly FeedSource[] = [
  {
    name: "TechCrunch",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
  },
  {
    name: "The Verge",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
  },
];

// 지난 24시간 이내 기사만 수집한다.
export const FETCH_WINDOW_MS = 24 * 60 * 60 * 1000;
// 소스 하나당 요청 제한 시간
export const FEED_TIMEOUT_MS = 8000;
