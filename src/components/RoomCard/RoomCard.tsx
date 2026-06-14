import { FC } from 'react';
import Image from 'next/image';
import { Room } from '@/models/room';
import Link from 'next/link';

type Props = {
  room: Room;
};

const RoomCard: FC<Props> = ({ room }) => {

  const {
    coverImage,
    images,
    name,
    price,
    type,
    description,
    slug,
    numberOfBeds,
    dimension,
  } = room;

  const roomTypeLabels: Record<string, string> = {
    casa: 'Casa',
    quarto_independente: 'Quarto independente',
    casa_privativa: 'Casa com espaço social privativo',
  };

  const secondImage = images?.[0]?.url;

  return (
    <div className='rounded-xl w-72 mb-10 mx-auto md:mx-0 overflow-hidden text-black dark:text-white bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900 flex flex-col'>
      {/* FOTO COM HOVER */}
      <Link href={`/rooms/${slug.current}`}>
        <div className='h-60 overflow-hidden relative group cursor-pointer'>
          {/* IMAGEM PRINCIPAL */}
          <Image
            src={coverImage?.url || '/placeholder.jpg'}
            alt={name}
            width={400}
            height={300}
            className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
          />

          {/* OVERLAY ESCURO NO HOVER */}
          <div className='absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300' />
        </div>
      </Link>

      <div className='p-4 flex flex-col flex-1'>
        {/* NOME + PREÇO */}
        <div className='flex justify-between text-xl font-semibold dark:text-white'>
          <p>{name}</p>
          <p>R$ {price}</p>
        </div>

        {/* TIPO + CAMAS + TAMANHO */}
        <p className='pt-2 text-xs text-gray-600 dark:text-gray-400'>
          {roomTypeLabels[type] || type}
          {numberOfBeds &&
            ` • ${numberOfBeds} cama${numberOfBeds > 1 ? 's' : ''}`}
          {dimension && ` • ${dimension}m²`}
        </p>

        {/* DESCRIÇÃO */}
        <p className='pt-3 pb-6 text-sm flex-1 dark:text-gray-300'>
          {description?.slice(0, 100)}...
        </p>

        {/* BOTÃO RESERVAR */}
        <Link
          href={`/rooms/${slug.current}`}
          className='bg-primary inline-block text-center w-full py-4 rounded-xl text-white text-xl font-bold hover:-translate-y-1 hover:shadow-lg transition-all duration-300 mt-auto'
        >
          RESERVAR
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;
