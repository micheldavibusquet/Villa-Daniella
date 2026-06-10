'use client';

import { FC } from 'react';

type Props = {
  heading1: React.ReactNode;
  section2: React.ReactNode;
};

const ClientComponent: FC<Props> = ({ heading1, section2 }) => {
  return (
    <section className='container mx-auto flex items-start gap-10 xl:gap-20 px-6 md:px-10 xl:px-16 py-10 overflow-hidden'>
      {/* Coluna esquerda — texto e tipos de acomodação */}
      <div className='flex flex-col justify-start h-full max-w-xl flex-shrink-0'>
        {heading1}

        {/* TIPOS DE ACOMODAÇÃO */}
        <div className='flex gap-6 mt-10 flex-wrap text-sm text-gray-600 dark:text-gray-300'>
          <p>Quarto independente</p>
          <p>•</p>
          <p>Casa completa</p>
          <p>•</p>
          <p>Casa com área social privativa</p>
        </div>
      </div>

      {/* Coluna direita — galeria de imagens */}
      <div className='flex-1 min-w-0'>{section2}</div>
    </section>
  );
};

export default ClientComponent;