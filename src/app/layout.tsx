import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist_Mono } from "next/font/google";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI뉴스 모아보기",
  description: "AI 뉴스를 Claude가 한국어로 요약하고 분류합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // cacheComponents가 켜져 있어 Clerk가 읽는 요청 정보(쿠키·헤더)는 <Suspense> 안에 있어야 한다.
  return (
    <html
      lang="ko"
      className={`${geistMono.variable} h-full antialiased`}
      // 테마 스크립트가 hydration 전에 dark 클래스를 붙이므로 불일치 경고를 끈다.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <ClerkProvider>{children}</ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
