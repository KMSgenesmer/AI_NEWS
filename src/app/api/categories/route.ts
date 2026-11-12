import { and, eq, lt, max, sql } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { isColorKey } from "@/lib/category-color";

const SLUG_MAX_LENGTH = 30;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// 로그인 확인은 src/proxy.ts 가 /api 전체에 대해 처리한다.
const NAME_MAX_LENGTH = 20;
// "미분류"는 항상 맨 뒤(sort_order 99)에 둔다.
const UNCATEGORIZED_SORT_ORDER = 99;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const name =
    typeof body?.name === "string" ? body.name.trim().replace(/\s+/g, " ") : "";

  if (!name) {
    return Response.json({ error: "이름을 입력해 주세요" }, { status: 400 });
  }
  if (name.length > NAME_MAX_LENGTH) {
    return Response.json(
      { error: `이름은 ${NAME_MAX_LENGTH}자 이하로 입력해 주세요` },
      { status: 400 },
    );
  }

  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  if (!slug) {
    return Response.json({ error: "영문 ID를 입력해 주세요" }, { status: 400 });
  }
  if (slug.length > SLUG_MAX_LENGTH || !SLUG_PATTERN.test(slug)) {
    return Response.json(
      { error: "영문 ID는 영문 소문자·숫자·하이픈(-)만 쓸 수 있어요" },
      { status: 400 },
    );
  }
  if (!isColorKey(body?.color) || body.color === "slate") {
    return Response.json({ error: "색상을 선택해 주세요" }, { status: 400 });
  }
  const color: string = body.color;

  try {
    const [slugTaken] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (slugTaken) {
      return Response.json({ error: "이미 있는 영문 ID예요" }, { status: 409 });
    }

    // 대소문자만 다른 이름도 중복으로 본다. (예: "it" / "IT")
    const [duplicate] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(sql`lower(${categories.name}) = lower(${name})`)
      .limit(1);
    if (duplicate) {
      return Response.json({ error: "이미 있는 카테고리예요" }, { status: 409 });
    }

    const [last] = await db
      .select({ value: max(categories.sortOrder) })
      .from(categories)
      .where(and(lt(categories.sortOrder, UNCATEGORIZED_SORT_ORDER)));

    const [created] = await db
      .insert(categories)
      .values({ name, slug, color, sortOrder: (last?.value ?? 0) + 1 })
      .onConflictDoNothing()
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        color: categories.color,
      });

    // 동시에 같은 이름/ID가 들어온 경우 unique 제약에 걸려 아무것도 반환되지 않는다.
    if (!created) {
      return Response.json(
        { error: "이미 있는 카테고리 이름 또는 영문 ID예요" },
        { status: 409 },
      );
    }
    return Response.json(created, { status: 201 });
  } catch (error) {
    console.error("카테고리 추가 실패", error);
    return Response.json(
      { error: "카테고리를 추가하지 못했어요. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }
}
