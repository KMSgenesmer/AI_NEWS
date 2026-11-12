ALTER TABLE "categories" ADD COLUMN "slug" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "color" text;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE("slug");
--> statement-breakpoint
UPDATE "categories" SET "slug" = v.slug, "color" = v.color
FROM (VALUES
  ('정치','politics','rose'),
  ('경제','economy','amber'),
  ('사회','society','sky'),
  ('국제','world','teal'),
  ('IT/과학','tech','indigo'),
  ('문화','culture','violet'),
  ('스포츠','sports','emerald'),
  ('미분류','uncategorized','slate')
) AS v(name, slug, color)
WHERE "categories"."name" = v.name AND "categories"."slug" IS NULL;