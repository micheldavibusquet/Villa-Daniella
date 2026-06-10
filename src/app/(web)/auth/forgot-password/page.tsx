'use client';

import { useState } from 'react';
import axios from 'axios';

/**
 * Página de recuperação de senha.
 * O usuário informa o email e recebe um link de reset.
 * Em desenvolvimento o link aparece na tela e no console do servidor.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setResetUrl('');

    try {
      const { data } = await axios.post('/api/auth/forgot-password', { email });
      setMessage(data.message);
      // Em desenvolvimento a API retorna o link diretamente
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao processar solicitação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='flex flex-col items-center justify-center h-[70vh] gap-6'>
      <h1 className='text-2xl font-bold'>Recuperar Senha</h1>

      <p className='text-sm text-gray-500 text-center max-w-xs'>
        Digite seu email e enviaremos um link para redefinir sua senha.
      </p>

      {message && (
        <div className='bg-green-100 text-green-700 px-4 py-3 rounded text-center max-w-sm text-sm'>
          <p>{message}</p>
          {/* Link visível apenas em desenvolvimento para facilitar testes */}
          {resetUrl && (
            <a
              href={resetUrl}
              className='block mt-2 underline font-medium break-all'
            >
              Clique aqui para redefinir →
            </a>
          )}
        </div>
      )}

      {error && (
        <p className='text-red-500 text-sm text-center max-w-xs'>{error}</p>
      )}

      <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-72'>
        <input
          type='email'
          placeholder='seu@email.com'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className='border px-3 py-2 rounded'
        />
        <button
          type='submit'
          disabled={loading}
          className='bg-black text-white py-2 rounded disabled:opacity-60'
        >
          {loading ? 'Enviando...' : 'Enviar link de recuperação'}
        </button>
      </form>

      <a href='/auth/signin' className='text-sm underline text-gray-400'>
        Voltar ao login
      </a>
    </div>
  );
}
