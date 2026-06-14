'use client';

import { useState } from 'react';

const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubscribe = () => {
    if (!email || !email.includes('@')) {
      setMessage('Digite um email válido');
      return;
    }

    // Simulação de sucesso (pode integrar depois com backend)
    setMessage('Cadastro realizado com sucesso!');
    setEmail('');
  };

  return (
    <section className="bg-primary rounded-2xl py-16 px-6 text-center text-white">
      
      <p className="mb-2">
        Conheça mais sobre a Villa Daniella
      </p>

      <h2 className="text-3xl md:text-5xl font-bold mb-10">
        Aproveite, crie o seu cadastro <br />
        e fique sabendo de todas as nossas novidades.
      </h2>

      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
        <input
          type="email"
          placeholder="Digite o seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-6 py-3 rounded-lg text-black w-full md:w-96 dark:text-gray-900"
        />

        <button
          onClick={handleSubscribe}
          className="bg-secondary px-6 py-3 rounded-lg font-semibold"
        >
          Inscreva-se!
        </button>
      </div>

      {message && (
        <p className="mt-4 text-sm">{message}</p>
      )}
    </section>
  );
};

export default NewsLetter;
