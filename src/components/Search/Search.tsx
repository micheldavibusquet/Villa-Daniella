'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useState, useEffect } from 'react';
import { PUBLIC_ROOM_TYPES } from '@/libs/roomTypes';
import { getRooms } from '@/libs/apis';

type Props = {
  roomTypeFilter: string;
  setRoomTypeFilter: (value: string) => void;
};

const Search: FC<Props> = ({ roomTypeFilter, setRoomTypeFilter }) => {
  const router = useRouter();

  const [capacity, setCapacity] = useState('all');
  const [maxGuests, setMaxGuests] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Valores máximos calculados a partir das acomodações reais
  const [maxBeds, setMaxBeds] = useState(1);
  const [maxGuestsLimit, setMaxGuestsLimit] = useState(2);

  // Busca as acomodações e calcula os limites dos filtros
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const rooms = await getRooms();
        if (rooms && rooms.length > 0) {
          const beds = Math.max(...rooms.map((r) => r.numberOfBeds ?? 1));
          const guests = Math.max(...rooms.map((r) => r.maxGuests ?? 2));
          setMaxBeds(beds);
          setMaxGuestsLimit(guests);
        }
      } catch (error) {
        console.error('Erro ao calcular limites dos filtros:', error);
      }
    };
    fetchLimits();
  }, []);

  const handleRoomTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRoomTypeFilter(event.target.value);
  };

  const handleFilterClick = () => {
    router.push(
      `/rooms?roomType=${roomTypeFilter}&capacity=${capacity}&maxGuests=${maxGuests}&minPrice=${minPrice}&maxPrice=${maxPrice}`,
    );
  };

  return (
    <section className='bg-tertiary-light dark:bg-gray-800 px-4 py-6 rounded-lg mt-8'>
      <div className='container mx-auto grid grid-cols-1 md:grid-cols-5 gap-4 items-end'>
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
            {PUBLIC_ROOM_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* CAMAS */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black dark:text-gray-100'>
            Camas
          </label>

          <select
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className='w-full px-4 py-2 rounded leading-tight bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none'
          >
            <option value='all'>Todas</option>
            {Array.from({ length: maxBeds }, (_, i) => i + 1).map((n) => {
              const isMax = n === maxBeds;
              const plural = n > 1 ? 's' : '';
              return (
                <option key={n} value={n}>
                  {isMax ? `${n} cama${plural}` : `${n} ou mais cama${plural}`}
                </option>
              );
            })}
          </select>
        </div>

        {/* HÓSPEDES */}
        <div>
          <label className='block text-sm font-medium mb-2 text-black dark:text-gray-100'>
            Hóspedes
          </label>

          <select
            value={maxGuests}
            onChange={(e) => setMaxGuests(e.target.value)}
            className='w-full px-4 py-2 rounded leading-tight bg-white dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:outline-none'
          >
            <option value='all'>Todos</option>
            {Array.from({ length: maxGuestsLimit - 1 }, (_, i) => i + 2).map(
              (n) => {
                const isMax = n === maxGuestsLimit;
                return (
                  <option key={n} value={n}>
                    {isMax ? `${n} hóspedes` : `${n} ou mais hóspedes`}
                  </option>
                );
              },
            )}
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
