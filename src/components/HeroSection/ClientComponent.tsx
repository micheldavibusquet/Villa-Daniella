'use client';

import { FC } from 'react';

type Props = {
  heading1: React.ReactNode;
  section2: React.ReactNode;
};

const ClientComponent: FC<Props> = ({ heading1, section2 }) => {
  return (
    <section className='flex px-6 items-start gap-20 container mx-auto'>

      {/* TEXTO */}
      <div className='flex flex-col justify-start h-full max-w-xl'>
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

      {/* IMAGENS */}
      {section2}

    </section>
  );
};

export default ClientComponent;