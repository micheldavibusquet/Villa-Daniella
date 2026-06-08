"use client";

console.log("PAGINA NOVA");

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const params = useSearchParams();
  const error = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });

    if (res?.error) {
      console.log("ERRO LOGIN:", res.error);
    }

    if (res?.ok) {
      window.location.href = "/";
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6">

      <h1 className="text-2xl font-bold dark:text-white">Login</h1>

      {/* 🔴 ERRO */}
      {error && (
        <div className="bg-red-500 text-white px-4 py-2 rounded text-center max-w-md">
          {error === "CredentialsSignin"
            ? "E-mail ou senha inválidos."
            : error === "AccessDenied"
            ? "Use login com Google para esta conta."
            : "Não foi possível realizar o login."}
        </div>
      )}

      {/* 🔵 GOOGLE */}
      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="bg-blue-600 text-white px-4 py-2 rounded w-72"
      >
        Entrar com Google
      </button>

      <p className="text-sm text-gray-400 dark:text-gray-500">ou</p>

      {/* ⚫ EMAIL/SENHA */}
      <form
        onSubmit={handleCredentialsLogin}
        className="flex flex-col gap-3 w-72"
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-[#46220f] dark:bg-amber-700 text-white py-2 rounded hover:bg-[#5a2e16] transition-colors"
        >
          {loading ? "Entrando..." : "Entrar com email"}
        </button>
      </form>

      {/* 🟡 AJUDA */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
        Não lembra sua senha? Use o login com Google.
      </p>

      <p className="text-sm">
        Não tem conta?{" "}
        <a href="/auth/signup" className="underline">
          Criar conta
        </a>
      </p>
    </div>
  );
}