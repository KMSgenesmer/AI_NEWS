import { UNCATEGORIZED } from "./prompt";

// Claude를 쓸 수 없을 때(키 오류·한도 초과 등)를 위한 임시 분류기.
// 제목·설명에 키워드가 가장 많이 나오는 카테고리를 고른다.
// 수집원이 AI/기술 뉴스라서 아무것도 안 맞으면 "IT/과학"으로 둔다.
const RULES: { name: string; words: RegExp }[] = [
  {
    name: "정치",
    words:
      /\b(congress|senate|senator|white house|trump|biden|election|regulat\w*|law|lawmakers?|bill|legislation|government|policy|ban|court|lawsuit|sues?|fcc|ftc|doj|antitrust)\b/gi,
  },
  {
    name: "경제",
    words:
      /\b(funding|raises?|raised|valuation|investors?|investment|revenue|stock|shares|ipo|billion|million|acquires?|acquisition|startup|earnings|profit|market|tariffs?|layoffs?|pricing|price)\b/gi,
  },
  {
    name: "국제",
    words:
      /\b(china|chinese|europe|european|eu|india|japan|korea|russia|ukraine|uk|britain|global|international|beijing)\b/gi,
  },
  {
    name: "스포츠",
    words:
      /\b(nfl|nba|mlb|fifa|olympics?|soccer|football|basketball|tennis|f1|athletes?|sports?)\b/gi,
  },
  {
    name: "문화",
    words:
      /\b(movie|film|netflix|spotify|music|artists?|games?|gaming|streaming|hollywood|tv|show|book|podcast|creators?|youtube|tiktok)\b/gi,
  },
  {
    name: "사회",
    words:
      /\b(teens?|children|kids|school|students?|education|health|mental|safety|privacy|jobs?|workers?|suicide|abuse|community|families|parents)\b/gi,
  },
];

export function guessCategory(
  title: string,
  summary: string,
  availableNames: string[],
): string {
  const text = `${title} ${title} ${summary}`; // 제목에 가중치
  let best = "";
  let bestScore = 0;
  for (const rule of RULES) {
    if (!availableNames.includes(rule.name)) continue;
    const score = (text.match(rule.words) ?? []).length;
    if (score > bestScore) {
      best = rule.name;
      bestScore = score;
    }
  }
  if (best) return best;
  return availableNames.includes("IT/과학") ? "IT/과학" : UNCATEGORIZED;
}
