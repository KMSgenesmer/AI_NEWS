import Anthropic from "@anthropic-ai/sdk";
import type { SourceItem } from "@/lib/rss/parse-feed";
import {
  buildOutputSchema,
  buildSystemPrompt,
  buildUserMessage,
  ENRICH_MODEL,
  UNCATEGORIZED,
} from "./prompt";

export type Enriched = {
  titleKo: string;
  summaryKo: string;
  /** 반드시 categoryNames 중 하나 (아니면 "미분류") */
  category: string;
};

const BATCH_SIZE = 10;
const CONCURRENCY = 3;

async function enrichBatch(
  client: Anthropic,
  batch: { id: number; item: SourceItem }[],
  categoryNames: string[],
): Promise<Map<number, Enriched>> {
  const response = await client.messages.create({
    model: ENRICH_MODEL,
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: buildSystemPrompt(categoryNames),
        cache_control: { type: "ephemeral" },
      },
    ],
    output_config: {
      effort: "low",
      format: { type: "json_schema", schema: buildOutputSchema(categoryNames) },
    },
    messages: [
      {
        role: "user",
        content: buildUserMessage(
          batch.map(({ id, item }) => ({
            id,
            title: item.title,
            summary: item.summary,
            press: item.press,
          })),
        ),
      },
    ],
  });

  if (response.stop_reason === "refusal" || response.stop_reason === "max_tokens") {
    throw new Error(`Claude 응답 중단: ${response.stop_reason}`);
  }
  const text = response.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("Claude 응답에 텍스트가 없어요");

  const parsed = JSON.parse(text.text) as { results?: unknown };
  const out = new Map<number, Enriched>();
  const validIds = new Set(batch.map((b) => b.id));
  if (!Array.isArray(parsed.results)) return out;

  for (const r of parsed.results) {
    if (!r || typeof r !== "object") continue;
    const { id, titleKo, summaryKo, category } = r as Record<string, unknown>;
    if (typeof id !== "number" || !validIds.has(id)) continue;
    if (typeof titleKo !== "string" || !titleKo.trim()) continue;
    if (typeof summaryKo !== "string" || !summaryKo.trim()) continue;
    out.set(id, {
      titleKo: titleKo.trim(),
      summaryKo: summaryKo.trim(),
      category:
        typeof category === "string" && categoryNames.includes(category)
          ? category
          : UNCATEGORIZED,
    });
  }
  return out;
}

// 기사 배열을 번역·요약·분류한다. 결과는 입력 배열의 인덱스로 찾는다.
// 일부 배치가 실패해도 던지지 않고, 결과에 없는 인덱스는 호출한 쪽에서 폴백 처리한다.
export async function enrichArticles(
  items: SourceItem[],
  categoryNames: string[],
): Promise<Map<number, Enriched>> {
  const results = new Map<number, Enriched>();
  if (items.length === 0) return results;

  const names = categoryNames.includes(UNCATEGORIZED)
    ? categoryNames
    : [...categoryNames, UNCATEGORIZED];

  let client: Anthropic;
  try {
    client = new Anthropic();
  } catch (error) {
    console.error("[Claude 처리] 클라이언트 생성 실패", error);
    return results;
  }

  const batches: { id: number; item: SourceItem }[][] = [];
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(
      items.slice(i, i + BATCH_SIZE).map((item, j) => ({ id: i + j, item })),
    );
  }

  // 간단한 워커 풀: CONCURRENCY개씩 병렬 처리
  let next = 0;
  const worker = async () => {
    while (next < batches.length) {
      const batch = batches[next++];
      try {
        const done = await enrichBatch(client, batch, names);
        done.forEach((value, id) => results.set(id, value));
      } catch (error) {
        console.error("[Claude 처리] 배치 실패, 원문으로 저장해요", error);
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, batches.length) }, worker),
  );

  return results;
}
