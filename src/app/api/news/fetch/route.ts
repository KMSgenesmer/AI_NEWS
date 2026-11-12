import { fetchFeeds } from "@/lib/rss/fetch-feeds";
import { saveArticles } from "@/lib/rss/save-articles";

// 로그인 확인은 src/proxy.ts 가 /api 전체에 대해 처리한다.
// 수집 + Claude 번역·요약·분류(배치 병렬)까지 한 요청에서 처리한다.
export const maxDuration = 60;

export async function POST() {
  const { items, failedSources, totalSources } =
    await fetchFeeds();

  // 모든 소스가 실패한 경우에만 오류로 본다.
  if (failedSources.length === totalSources) {
    return Response.json(
      {
        error: "뉴스를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.",
        failedSources,
      },
      { status: 502 },
    );
  }

  try {
    const { added, failedEnrich } = await saveArticles(items);
    return Response.json({
      added,
      failedEnrich,
      fetched: items.length,
      failedSources,
    });
  } catch (error) {
    console.error("기사 저장 실패", error);
    return Response.json(
      { error: "뉴스를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
