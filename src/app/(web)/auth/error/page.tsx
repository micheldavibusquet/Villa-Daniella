"use client";

import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
      <h1 className="text-2xl font-bold">Erro de login</h1>

      <p className="text-center max-w-md">
        Este e-mail já está cadastrado com outro método de login.
        <br />
        Tente entrar usando o método original.
      </p>

      <button
        onClick={() => signIn("google", { callbackUrl: "/" })}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Entrar com Google
      </button>

      {error && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Erro: {error}</p>
      )}
    </div>
  );
}