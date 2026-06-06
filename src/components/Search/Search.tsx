'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FC } from 'react';
import { useState } from 'react';
import { PUBLIC_ROOM_TYPES } from '@/libs/roomTypes';

type Props = {
  roomTypeFilter: string;
  setRoomTypeFilter: (value: string) => void;
};

const Search: FC<Props> = ({ roomTypeFilter, setRoomTypeFilter }) => {
  const router = useRouter();
  const [capacity, setCapacity] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleRoomTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRoomTypeFilter(event.target.value);
  };

  // Monta a URL com os filtros e navega para a página de acomodações
  const handleFilterClick = () => {
    router.push(
      `/rooms?roomType=${roomTypeFilter}&capacity=${capacity}&minPrice=${minPrice}&maxPrice=${maxPrice}`,
    );
  };

  return (
    <section className='bg-tertiary-light px-4 py-6 rounded-lg mt-8'>
      <div className='container mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>
        {/* Filtro por tipo de acomodação */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black'>
            Acomodações
          </label>
          <select
            value={roomTypeFilter}
            onChange={handleRoomTypeChange}
            className='w-full px-4 py-2 capitalize rounded leading-tight dark:bg-black focus:outline-none'
          >
            <option value='all'>Tudo</option>
            {PUBLIC_ROOM_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por capacidade (número de camas) */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black'>
            Capacidade
          </label>
          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className='w-full px-4 py-2 rounded leading-tight dark:bg-black focus:outline-none'
          >
            <option value='all'>Todas</option>
            <option value='1'>1+ cama</option>
            <option value='2'>2+ camas</option>
            <option value='3'>3+ camas</option>
            <option value='4'>4+ camas</option>
          </select>
        </div>

        {/* Filtro por preço mínimo */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black'>
            Preço mínimo
          </label>
          <input
            type='number'
            placeholder='Ex: 200'
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className='w-full px-4 py-2 rounded leading-tight dark:bg-black focus:outline-none'
          />
        </div>

        {/* Filtro por preço máximo */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black'>
            Preço máximo
          </label>
          <input
            type='number'
            placeholder='Ex: 800'
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className='w-full px-4 py-2 rounded leading-tight dark:bg-black focus:outline-none'
          />
        </div>

        {/* Botão de pesquisa */}
        <div>
          <button
            className='btn-primary w-full'
            type='button'
            onClick={handleFilterClick}
          >
            Pesquisar
          </button>
        </div>
      </div>
    </section>
  );
};

export default Search;
