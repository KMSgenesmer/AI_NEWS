"use client";

import { SignInButton, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

// 접속하면 로그인 모달을 바로 띄우고, 닫아도 버튼으로 다시 열 수 있다.
export function SignInModal() {
  const { loaded, openSignIn } = useClerk();

  useEffect(() => {
    if (loaded) openSignIn({});
  }, [loaded, openSignIn]);

  return (
    <SignInButton mode="modal">
      <button
        type="button"
        className="h-12 rounded-full bg-foreground px-6 font-medium text-background transition-colors hover:opacity-80"
      >
        로그인
      </button>
    </SignInButton>
  );
}
