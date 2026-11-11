import * as cheerio from "cheerio";
import { FEED_TIMEOUT_MS } from "./sources";
import { normalizeUrl, toPlainSummary, type SourceItem } from "./parse-feed";

// 네이버 뉴스는 RSS를 제공하지 않고 robots.txt가 크롤링을 막고 있어,
// 공식 검색 API(https://developers.naver.com/docs/serviceapi/search/news/news.md)를 쓴다.
// 환경변수 NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 이 필요하다.
export const NAVER_SOURCE_NAME = "네이버 뉴스";
const ENDPOINT = "https://openapi.naver.com/v1/search/news.json";
// 이 앱의 주제(AI)에 맞는 검색어. 결과는 URL 기준으로 합쳐진다.
const QUERIES = ["인공지능", "생성형 AI"];

type NaverItem = {
  title: string;
  originallink: string;
  link: string;
  description: string;
  pubDate: string;
};

// 검색 결과의 제목/요약에는 <b> 태그와 HTML 엔티티가 섞여 있다.
function plain(html: string): string {
  return cheerio.load(html).text().trim();
}

function pressFromUrl(originallink: string): string {
  try {
    return new URL(originallink).hostname.replace(/^www\./, "");
  } catch {
    return NAVER_SOURCE_NAME;
  }
}

async function search(query: string, since: Date): Promise<SourceItem[]> {
  const id = process.env.NAVER_CLIENT_ID;
  const secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) {
    throw new Error("NAVER_CLIENT_ID / NAVER_CLIENT_SECRET 환경변수가 없습니다.");
  }

  const url = `${ENDPOINT}?${new URLSearchParams({
    query,
    display: "100",
    sort: "date",
  })}`;
  const res = await fetch(url, {
    headers: { "X-Naver-Client-Id": id, "X-Naver-Client-Secret": secret },
    cache: "no-store",
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`네이버 API 응답 오류 (${res.status})`);

  const data = (await res.json()) as { items?: NaverItem[] };
  const items: SourceItem[] = [];
  for (const raw of data.items ?? []) {
    const publishedAt = new Date(raw.pubDate);
    if (Number.isNaN(publishedAt.getTime()) || publishedAt < since) continue;
    const link = normalizeUrl(raw.link || raw.originallink);
    const title = plain(raw.title);
    if (!link || !title) continue;
    items.push({
      title,
      url: link,
      summary: toPlainSummary(raw.description),
      author: null, // 검색 API는 기자명을 제공하지 않는다.
      publishedAt,
      press: pressFromUrl(raw.originallink || raw.link),
    });
  }
  return items;
}

export async function fetchNaverNews(since: Date): Promise<SourceItem[]> {
  const results = await Promise.all(QUERIES.map((q) => search(q, since)));
  return results.flat();
}
