'use client';
import { FC } from 'react';
import { PUBLIC_ROOM_TYPES } from '@/libs/roomTypes';

type Props = {
  heading1: React.ReactNode;
  section2: React.ReactNode;
};

const ClientComponent: FC<Props> = ({ heading1, section2 }) => {
  return (
    <section className='flex px-6 items-start gap-20 container mx-auto'>
      <div className='flex flex-col justify-start h-full max-w-xl'>
        {heading1}
        {/* Tipos de acomodação — gerados dinamicamente de roomTypes.ts */}
        <div className='flex gap-3 mt-10 flex-wrap text-sm text-gray-600'>
          {PUBLIC_ROOM_TYPES.map((type, index) => (
            <span key={type.value} className='flex items-center gap-3'>
              {index > 0 && <span>•</span>}
              {type.label}
            </span>
          ))}
        </div>
      </div>
      {section2}
    </section>
  );
};

export default ClientComponent;
