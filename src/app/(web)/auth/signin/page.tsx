'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const params = useSearchParams();
  const router = useRouter();

  // Erro vindo da URL (ex: sessão expirada, acesso negado)
  const urlError = params.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Erro gerado pelo formulário de login
  const [formError, setFormError] = useState('');

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError('');

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/',
    });

    if (res?.error) {
      // Usuário não encontrado — redireciona para cadastro com email preenchido
      if (res.error === 'USER_NOT_FOUND') {
        router.push(
          `/auth/signup?email=${encodeURIComponent(email)}&msg=Conta não encontrada. Crie uma conta para continuar.`,
        );
        return;
      }
      if (res.error === 'ACCOUNT_DISABLED') {
        setFormError(
          'Esta conta foi desativada. Entre em contato com o administrador.',
        );
        setLoading(false);
        return;
      }

      // Conta criada via Google — sem senha cadastrada
      if (res.error === 'Use login com Google') {
        setFormError('Esta conta usa login com Google.');
        setLoading(false);
        return;
      }

      // Senha incorreta
      setFormError('Email ou senha incorretos.');
    }

    if (res?.ok) {
      window.location.href = '/';
    }

    setLoading(false);
  }

  return (
    <div className='flex flex-col items-center justify-center h-[70vh] gap-6'>
      <h1 className='text-2xl font-bold'>Login</h1>

      {/* Erro vindo da URL (ex: sessão expirada) */}
      {urlError && (
        <div className='bg-red-500 text-white px-4 py-2 rounded text-center max-w-md'>
          {urlError === 'CredentialsSignin'
            ? 'E-mail ou senha inválidos.'
            : urlError === 'AccessDenied'
              ? 'Use login com Google para esta conta.'
              : 'Não foi possível realizar o login.'}
        </div>
      )}

      {/* Erro do formulário */}
      {formError && (
        <p className='text-red-500 text-sm text-center max-w-xs'>{formError}</p>
      )}

      {/* Botão Google */}
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className='bg-blue-600 text-white px-4 py-2 rounded w-72'
      >
        Entrar com Google
      </button>

      <p className='text-sm text-gray-400'>ou</p>

      {/* Formulário email/senha */}
      <form
        onSubmit={handleCredentialsLogin}
        className='flex flex-col gap-3 w-72'
      >
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className='border px-3 py-2 rounded'
        />

        <input
          type='password'
          placeholder='Senha'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='border px-3 py-2 rounded'
        />

        <button
          type='submit'
          disabled={loading}
          className='bg-black text-white py-2 rounded'
        >
          {loading ? 'Entrando...' : 'Entrar com email'}
        </button>
      </form>

      <p className='text-sm'>
        Não tem conta?{' '}
        <a href='/auth/signup' className='underline'>
          Criar conta
        </a>
      </p>
    </div>
  );
}
