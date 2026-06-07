'use client';

import { FC } from 'react';
import { PUBLIC_ROOM_TYPES } from '@/libs/roomTypes';

type Props = {
  heading1: React.ReactNode;
  section2: React.ReactNode;
};

/**
 * Componente client-side da seção hero da homepage.
 * Recebe o conteúdo principal (heading1) e as imagens (section2)
 * como props do servidor (HeroSection.tsx).
 *
 * Os tipos de acomodação são gerados dinamicamente a partir de
 * PUBLIC_ROOM_TYPES (roomTypes.ts), sem necessidade de editar este arquivo.
 */
const ClientComponent: FC<Props> = ({ heading1, section2 }) => {
  return (
    <section className='flex px-6 items-start gap-20 container mx-auto'>
      {/* Coluna esquerda — texto e tipos de acomodação */}
      <div className='flex flex-col justify-start h-full max-w-xl'>
        {heading1}

        {/* Tipos exibidos como texto corrido — evita problemas de quebra de linha */}
        <p className='mt-10 text-sm text-gray-500'>
          {PUBLIC_ROOM_TYPES.map((type, index) => (
            <span key={type.value}>
              {index > 0 && ' • '}
              {type.label}
            </span>
          ))}
        </p>
      </div>

      {/* Coluna direita — galeria de imagens */}
      {section2}
    </section>
  );
};

export default ClientComponent;
