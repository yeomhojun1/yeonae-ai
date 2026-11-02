"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogoMark } from "@/components/SiteChrome";

export default function AuthForm({
  mode,
  callbackUrl = "/",
}: {
  mode: "login" | "signup";
  callbackUrl?: string;
}) {
  const router = useRouter();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        // 1) 회원가입 → 2) 곧바로 로그인
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "회원가입에 실패했어요.");
          return;
        }
      }

      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        setError(
          isSignup
            ? "가입은 됐지만 자동 로그인에 실패했어요. 로그인 페이지에서 다시 시도해주세요."
            : "이메일 또는 비밀번호가 올바르지 않아요."
        );
        return;
      }
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했어요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto mt-8 w-full max-w-sm space-y-6 p-8">
      <div className="text-center">
        <LogoMark className="mx-auto h-10 w-10" />
        <h1 className="mt-4 text-[24px] font-medium text-ink-900">
          {isSignup ? "회원가입" : "로그인"}
        </h1>
        <p className="mt-2 text-sm text-ink-600">
          {isSignup
            ? "이메일로 가입하고 내 분석 기록을 저장하세요"
            : "로그인하면 내 분석 기록을 다시 볼 수 있어요"}
        </p>
      </div>

      {/* 카카오 로그인 (카카오 디자인 가이드의 노란 바탕 + 검은 말풍선) */}
      <button
        onClick={() => signIn("kakao", { callbackUrl })}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-[#FEE500] text-[15px] font-medium text-black/85 transition-[filter] duration-150 ease-out hover:brightness-95"
      >
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden>
          <path
            fill="#000"
            d="M12 3C6.5 3 2 6.6 2 11c0 2.9 1.9 5.4 4.8 6.8l-1 3.6c-.1.3.3.6.6.4l4.2-2.8c.5.1 1 .1 1.4.1 5.5 0 10-3.6 10-8S17.5 3 12 3Z"
          />
        </svg>
        카카오로 계속하기
      </button>

      <div className="flex items-center gap-3 text-xs text-ink-500">
        <span className="h-px flex-1 bg-ink-900/[0.08]" />
        또는 이메일로
        <span className="h-px flex-1 bg-ink-900/[0.08]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignup && (
          <div>
            <label className="mb-2 block text-sm font-medium text-ink-900">
              닉네임 <span className="font-normal text-ink-500">(선택)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="분석 결과에 표시될 이름"
              className="field"
            />
          </div>
        )}
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-900">
            이메일
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="field"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink-900">
            비밀번호
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8자 이상"
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="field"
          />
        </div>

        {error && (
          <p className="rounded-[10px] bg-brand-50 px-4 py-3 text-sm text-brand-700">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "처리 중" : isSignup ? "가입하고 시작하기" : "로그인"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-600">
        {isSignup ? (
          <>
            이미 계정이 있나요?{" "}
            <Link href="/login" className="font-medium text-brand-600 underline-offset-4 hover:underline">
              로그인
            </Link>
          </>
        ) : (
          <>
            아직 계정이 없나요?{" "}
            <Link href="/signup" className="font-medium text-brand-600 underline-offset-4 hover:underline">
              회원가입
            </Link>
          </>
        )}
      </p>

      <p className="text-center text-xs leading-5 text-ink-500">
        계속하면 <Link href="/terms" className="underline underline-offset-2">이용약관</Link> 및{" "}
        <Link href="/privacy" className="underline underline-offset-2">개인정보 처리방침</Link>에 동의하게 됩니다
      </p>
    </div>
  );
}
