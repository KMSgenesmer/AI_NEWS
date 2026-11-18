import { SignInModal } from "@/components/sign-in-modal";

export function SignedOutView() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-white p-8 text-center dark:bg-neutral-950">
      <h1 className="text-3xl font-bold tracking-tight">AI뉴스 모아보기</h1>
      <p className="text-slate-500 dark:text-neutral-400">
        로그인 후 이용할 수 있습니다.
      </p>
      <SignInModal />
    </main>
  );
}
