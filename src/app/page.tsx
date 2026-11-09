import { Show, UserButton } from "@clerk/nextjs";
import { SignInModal } from "@/components/sign-in-modal";

export default function Home() {
  return (
    <>
      <Show when="signed-out">
        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">AI뉴스 모아보기</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            로그인 후 이용할 수 있습니다.
          </p>
          <SignInModal />
        </main>
      </Show>

      <Show when="signed-in">
        <header className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/15">
          <span className="font-semibold">AI뉴스 모아보기</span>
          <UserButton />
        </header>
        <main className="flex-1 p-6">{/* TODO: 뉴스 목록 (PRD §12) */}</main>
      </Show>
    </>
  );
}
