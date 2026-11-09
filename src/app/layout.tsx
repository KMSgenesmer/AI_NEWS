import type { Metadata } from "next";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI뉴스 모아보기",
  description: "네이버 인기 뉴스를 Claude가 한국어로 요약하고 분류합니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // cacheComponents가 켜져 있어 Clerk가 읽는 요청 정보(쿠키·헤더)는 <Suspense> 안에 있어야 한다.
  return (
    <html
      lang="ko"
      className={`${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <ClerkProvider>{children}</ClerkProvider>
        </Suspense>
      </body>
    </html>
  );
}
