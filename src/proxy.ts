import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isApiRoute = (pathname: string) =>
  /^\/(api|trpc)(\/|$)/.test(pathname);

// 페이지는 리다이렉트 없이 통과시키고, 로그인 모달은 페이지(Show)에서 띄운다.
// API는 로그인하지 않은 요청을 401로 차단한다 (PRD 5.1).
export default clerkMiddleware(async (auth, req) => {
  if (!isApiRoute(req.nextUrl.pathname)) return;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: "로그인이 필요합니다." },
      { status: 401 },
    );
  }
});

export const config = {
  matcher: [
    // Next.js 내부 파일과 정적 파일은 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트는 항상 포함
    "/(api|trpc)(.*)",
  ],
};
