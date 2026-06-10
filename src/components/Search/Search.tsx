'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useState } from 'react';

type Props = {
  roomTypeFilter: string;
  setRoomTypeFilter: (value: string) => void;
};

const Search: FC<Props> = ({
  roomTypeFilter,
  setRoomTypeFilter,
}) => {
  const router = useRouter();

  const [capacity, setCapacity] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleRoomTypeChange = (
    event: ChangeEvent<HTMLSelectElement>
  ) => {
    setRoomTypeFilter(event.target.value);
  };

  const handleFilterClick = () => {
    router.push(
      `/rooms?roomType=${roomTypeFilter}&capacity=${capacity}&minPrice=${minPrice}&maxPrice=${maxPrice}`
    );
  };

  return (
<section className='bg-tertiary-light dark:bg-gray-800 px-4 py-6 rounded-lg mt-8'>
  <div className='container mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 items-end'>

        {/* TIPO DE ACOMODAÇÃO */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black dark:text-gray-100'>
            Acomodações
          </label>

          <select
            value={roomTypeFilter}
            onChange={handleRoomTypeChange}
            className='w-full px-4 py-2 capitalize rounded leading-tight bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none'
          >
            <option value='all'>Tudo</option>
            <option value='quarto_independente'>
              Quarto independente
            </option>
            <option value='casa'>
              Casa com área social coletiva
            </option>
            <option value='casa_privativa'>
              Casa com área social privativa
            </option>
          </select>
        </div>

        {/* CAPACIDADE */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black dark:text-gray-100'>
            Capacidade
          </label>

          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className='w-full px-4 py-2 rounded leading-tight bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none'
          >
            <option value='all'>Todas</option>
            <option value='1'>1+ cama</option>
            <option value='2'>2+ camas</option>
            <option value='3'>3+ camas</option>
            <option value='4'>4+ camas</option>
          </select>
        </div>

        {/* PREÇO MÍNIMO */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black dark:text-gray-100'>
            Preço mínimo
          </label>

          <input
            type='number'
            placeholder='Ex: 200'
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className='w-full px-4 py-2 rounded leading-tight bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none'
          />
        </div>

        {/* PREÇO MÁXIMO */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black dark:text-gray-100'>
            Preço máximo
          </label>

          <input
            type='number'
            placeholder='Ex: 800'
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className='w-full px-4 py-2 rounded leading-tight bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none'
          />
        </div>

        {/* BOTÃO */}
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
