import { defineConfig } from "drizzle-kit";

// drizzle-kit은 .env.local을 자동으로 읽지 않으므로 직접 로드한다.
try {
  process.loadEnvFile(".env.local");
} catch {
  // .env.local이 없으면 시스템 환경변수를 사용
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
