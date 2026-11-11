import * as cheerio from "cheerio";

// 피드 형식(RSS 2.0 / Atom)과 상관없이 쓰는 공통 형태
export type RawItem = {
  title: string;
  url: string;
  summary: string;
  author: string | null;
  publishedAt: Date | null;
};

// 소스 이름(press)이 붙은 수집 결과
export type SourceItem = RawItem & { press: string };

const SUMMARY_MAX_LENGTH = 300;

// 중복 판정이 흔들리지 않도록 추적용 파라미터와 해시를 제거한다.
export function normalizeUrl(raw: string): string | null {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) {
      if (/^(utm_|fbclid$|gclid$|ref$)/i.test(key)) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return null;
  }
}

// HTML 태그를 지우고 공백을 정리한 뒤 길이를 제한한다. (본문 전문은 저장하지 않는다.)
export function toPlainSummary(html: string): string {
  const text = cheerio
    .load(html)
    .text()
    .replace(/\s+/g, " ")
    // WordPress 피드의 꼬리말: "The post ... appeared first on ..."
    .replace(/\s*The post .* appeared first on .*$/i, "")
    .trim();
  return text.length > SUMMARY_MAX_LENGTH
    ? `${text.slice(0, SUMMARY_MAX_LENGTH - 1).trimEnd()}…`
    : text;
}

function parseDate(value: string): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function parseFeed(xml: string): RawItem[] {
  const $ = cheerio.load(xml, { xmlMode: true });
  const items: RawItem[] = [];

  // RSS 2.0: <item>, Atom: <entry>
  $("item, entry").each((_, el) => {
    const node = $(el);
    const isAtom = el.tagName === "entry";

    const title = node.children("title").first().text().trim();
    const link = isAtom
      ? (
          node.children('link[rel="alternate"]').first().attr("href") ??
          node.children("link").first().attr("href") ??
          ""
        )
      : node.children("link").first().text();
    const url = normalizeUrl(link);
    if (!title || !url) return;

    const summaryHtml = isAtom
      ? node.children("summary").first().text() ||
        node.children("content").first().text()
      : node.children("description").first().text();
    const author = isAtom
      ? node.children("author").children("name").first().text().trim()
      : node.children("dc\\:creator").first().text().trim();
    const published = isAtom
      ? node.children("published").first().text() ||
        node.children("updated").first().text()
      : node.children("pubDate").first().text();

    items.push({
      title: cheerio.load(title).text().trim(),
      url,
      summary: toPlainSummary(summaryHtml),
      author: author || null,
      publishedAt: parseDate(published.trim()),
    });
  });

  return items;
}
