'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

function maskPhone(value: string): string {
  // keep only digits
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  // mobile: (DD) 9XXXX-XXXX  —  landline: (DD) XXXX-XXXX
  const isMobile = digits.length === 11;
  const splitPos = isMobile ? 7 : 6;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, splitPos)}-${digits.slice(splitPos)}`;
}

export default function SignUpPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    const res = await fetch('/api/user/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${firstName.trim()} ${lastName.trim()}`,
        phone: phone.trim(),
        email,
        password,
      }),
    });

    const data = await res.text();

    if (res.ok) {
      await signIn('credentials', { email, password, redirect: false });
      router.push('/');
    } else {
      setError(data || 'Erro ao criar conta');
    }
  }

  const inputClass =
    'border px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-green-500';

  return (
    <div className='flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4'>
      <h1 className='text-2xl font-bold'>Criar conta</h1>

      <form
        onSubmit={handleSignUp}
        className='flex flex-col gap-3 w-full max-w-sm'
      >
        <div className='flex gap-3'>
          <input
            type='text'
            placeholder='Nome'
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            className={inputClass}
          />
          <input
            type='text'
            placeholder='Sobrenome'
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <input
          type='tel'
          placeholder='(48) 99999-9999'
          value={phone}
          onChange={(e) => setPhone(maskPhone(e.target.value))}
          required
          maxLength={15}
          className={inputClass}
        />

        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={inputClass}
        />

        <input
          type='password'
          placeholder='Senha'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className={inputClass}
        />

        <input
          type='password'
          placeholder='Confirmar senha'
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className={inputClass}
        />

        {error && <p className='text-red-600 text-sm text-center'>{error}</p>}

        <button
          type='submit'
          className='bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors'
        >
          Criar conta
        </button>
      </form>
    </div>
  );
}
