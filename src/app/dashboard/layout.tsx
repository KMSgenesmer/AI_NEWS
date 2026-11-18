import { auth } from "@clerk/nextjs/server";
import { SiteHeader } from "@/components/site-header";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const { userId } = await auth();

  // 로그아웃 상태에서는 헤더 없이 페이지가 보여주는 로그인 안내만 표시한다.
  if (!userId) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white text-slate-900 dark:bg-neutral-950 dark:text-neutral-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
      >
        본문으로 건너뛰기
      </a>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6"
      >
        {children}
      </main>
    </div>
  );
}
