import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  // 영문 ID (소문자·숫자·하이픈). 기존 행은 마이그레이션에서 채우고, 없으면 null.
  slug: text("slug").unique(),
  // category-color.ts 의 색 이름 (rose, amber, ...). null이면 이름 기반 기본 색.
  color: text("color"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  // 번역 전 원문 제목. 번역 품질 확인과 재처리용.
  titleOriginal: text("title_original"),
  summary: text("summary").notNull(),
  // 중복 방지를 위해 URL은 고유값
  url: text("url").notNull().unique(),
  press: text("press"),
  author: text("author"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  // 카테고리 삭제 시 "미분류"로 옮기는 작업은 앱 코드(트랜잭션)에서 처리한다.
  // FK에 cascade를 두지 않아, 옮기지 않고 삭제하면 DB가 거부한다.
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  fetchedAt: timestamp("fetched_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  notionSaved: boolean("notion_saved").notNull().default(false),
  notionPageUrl: text("notion_page_url"),
  // 수집 시점의 순위 (1이 가장 높음). 현재 수집원에서는 채우지 않아 null.
  rank: integer("rank"),
}, (table) => [
  index("articles_category_id_idx").on(table.categoryId),
  index("articles_published_at_idx").on(table.publishedAt.desc()),
  index("articles_rank_idx").on(table.rank),
]);

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Article = typeof articles.$inferSelect;
export type NewArticle = typeof articles.$inferInsert;
