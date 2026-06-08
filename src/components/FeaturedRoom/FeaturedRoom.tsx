'use client';

import { FC } from 'react';
import Image from 'next/image';
import { Room } from '@/models/room';
import Link from 'next/link';

type Props = {
  featuredRoom: Room | null;
};

const FeaturedRoom: FC<Props> = ({ featuredRoom }) => {
  // ❌ NÃO mostrar loading
  if (!featuredRoom) return null;

  return (
    <section className='flex md:flex-row flex-col px-4 py-10 items-center gap-12 container mx-auto'>
      
      <div className='md:grid gap-8 grid-cols-1'>
        <div className='rounded-2xl overflow-hidden h-48 mb-4 md:mb-0'>
          <Image
            src={featuredRoom.coverImage?.url || '/fallback.jpg'}
            alt={featuredRoom.name}
            width={700}
            height={700}
            className='img scale-animation'
          />
        </div>
      </div>

      <div className='md:py-10 md:w-1/2 text-left'>
        <h3 className='font-heading mb-12'>Em destaque</h3>

        <p className='font-normal max-w-md dark:text-gray-300'>
          {featuredRoom.description}
        </p>

        <div className='flex flex-col md:flex-row md:items-end justify-between mt-5'>
          
          <div className='flex mb-3 md:mb-0'>
            <div className='flex gap-3 flex-col items-center justify-center mr-4'>
              <p className='text-xs lg:text-xl text-center'>
                Comece por aqui
              </p>

              <p className='md:font-bold flex font-medium text-lg xl:text-5xl'>
                R$ {featuredRoom.price}
              </p>
            </div>
          </div>

          <Link
            href={`/rooms/${featuredRoom.slug.current}`}
            className='border h-fit text-center border-tertiary-dark text-tertiary-dark dark:border-amber-400 dark:text-amber-400 px-3 py-2 lg:py-5 lg:px-7 rounded-2xl font-bold lg:text-xl'
          >
            Mais Detalhes
          </Link>

        </div>
      </div>
    </section>
  );
};

export default FeaturedRoom;