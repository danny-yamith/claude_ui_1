"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

type Mode = "login" | "register";

function AuthForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>(
    searchParams.get("mode") === "register" ? "register" : "login"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const param = searchParams.get("mode");
    setMode(param === "register" ? "register" : "login");
    setError("");
  }, [searchParams]);

  function switchMode(next: Mode) {
    setError("");
    router.replace(`/authenticate?mode=${next}`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } =
        mode === "login"
          ? await signIn.email({ email, password }, {
              onSuccess: () => {
                router.push("/dashboard");
              }
            })
          : await signUp.email({ name, email, password }, {
              onSuccess: () => {
                router.push("/dashboard");
              }
            });

      if (error) {
        setError(error.message || (mode === "login" ? "Sign in failed" : "Sign up failed"));
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Notes</h1>
          <p className="mt-1 text-slate-500 text-sm">Your thoughts, organized.</p>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg border border-slate-200 bg-white p-1 mb-6 shadow-sm">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              isLogin
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              !isLogin
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Create account
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                minLength={8}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm transition-colors mt-2"
            >
              {loading
                ? isLogin
                  ? "Signing in…"
                  : "Creating account…"
                : isLogin
                ? "Sign in"
                : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {isLogin ? "New here? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(isLogin ? "register" : "login")}
            className="text-blue-600 hover:underline font-medium"
          >
            {isLogin ? "Create an account" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
