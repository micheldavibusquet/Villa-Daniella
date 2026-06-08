'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import axios from 'axios';

/**
 * Página de redefinição de senha.
 * Recebe token e email via query string (?token=xxx&email=xxx).
 * Valida os dados, envia para a API e redireciona ao login.
 */
export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get('token');
  const email = params.get('email');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Link inválido — token ou email ausentes na URL
  if (!token || !email) {
    return (
      <div className='flex flex-col items-center justify-center h-[70vh] gap-4'>
        <p className='text-red-500 font-medium'>Link inválido ou expirado.</p>
        <a href='/auth/forgot-password' className='underline text-sm'>
          Solicitar novo link
        </a>
      </div>
    );
  }

  // Tela de sucesso com redirecionamento automático
  if (success) {
    return (
      <div className='flex flex-col items-center justify-center h-[70vh] gap-4'>
        <div className='bg-green-100 text-green-700 px-6 py-4 rounded text-center'>
          <p className='font-semibold text-lg'>✅ Senha redefinida!</p>
          <p className='text-sm mt-1'>
            Redirecionando para o login em 3 segundos...
          </p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validações no cliente antes de chamar a API
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirm) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/api/auth/reset-password', { token, email, password });
      setSuccess(true);
      // Redireciona para login após 3 segundos
      setTimeout(() => router.push('/auth/signin'), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          'Erro ao redefinir senha. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col items-center justify-center h-[70vh] gap-6'>
      <h1 className='text-2xl font-bold'>Nova Senha</h1>

      <p className='text-sm text-gray-500 text-center max-w-xs'>
        Digite e confirme sua nova senha abaixo.
      </p>

      {error && (
        <p className='text-red-500 text-sm text-center max-w-xs'>{error}</p>
      )}

      <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-72'>
        <input
          type='password'
          placeholder='Nova senha (mín. 6 caracteres)'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className='border px-3 py-2 rounded'
        />
        <input
          type='password'
          placeholder='Confirmar nova senha'
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          className='border px-3 py-2 rounded'
        />
        <button
          type='submit'
          disabled={loading}
          className='bg-black text-white py-2 rounded disabled:opacity-60'
        >
          {loading ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>
    </div>
  );
}
