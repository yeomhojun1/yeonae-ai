"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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
    <div className="mx-auto w-full max-w-sm space-y-6 py-8">
      <div className="text-center">
        <div className="text-5xl">💘</div>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-800">
          {isSignup ? "회원가입" : "로그인"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {isSignup
            ? "이메일로 가입하고 내 분석 기록을 저장하세요."
            : "로그인하면 내 분석 기록을 다시 볼 수 있어요."}
        </p>
      </div>

      {/* 카카오 로그인 */}
      <button
        onClick={() => signIn("kakao", { callbackUrl })}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 font-bold text-[#3C1E1E] transition hover:brightness-95"
      >
        <span aria-hidden>💬</span> 카카오로 계속하기
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        또는 이메일로
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {isSignup && (
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              닉네임 <span className="font-normal text-slate-400">(선택)</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="분석 결과에 표시될 이름"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            이메일
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
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
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </div>

        {error && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-500 py-3 font-bold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "처리 중…"
            : isSignup
            ? "가입하고 시작하기"
            : "로그인"}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500">
        {isSignup ? (
          <>
            이미 계정이 있나요?{" "}
            <Link href="/login" className="font-semibold text-brand-600 hover:underline">
              로그인
            </Link>
          </>
        ) : (
          <>
            아직 계정이 없나요?{" "}
            <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
              회원가입
            </Link>
          </>
        )}
      </p>

      <p className="text-center text-xs text-slate-400">
        계속하면 <Link href="/terms" className="underline">이용약관</Link> 및{" "}
        <Link href="/privacy" className="underline">개인정보 처리방침</Link>에 동의하게 됩니다.
      </p>
    </div>
  );
}
