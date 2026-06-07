'use client';

import { useRouter } from 'next/navigation';
import { ChangeEvent, FC, useState } from 'react';
import { PUBLIC_ROOM_TYPES } from '@/libs/roomTypes';

/**
 * Componente de busca e filtro de acomodações.
 * Os filtros são passados como parâmetros na URL para a página /rooms,
 * que os lê e aplica na listagem.
 *
 * Parâmetros da URL gerados:
 * - roomType: tipo de acomodação (ex: 'suite')
 * - capacity: número mínimo de camas
 * - guests: número exato de hóspedes
 * - minPrice: preço mínimo por noite
 * - maxPrice: preço máximo por noite
 */

type Props = {
  roomTypeFilter: string;
  setRoomTypeFilter: (value: string) => void;
};

const Search: FC<Props> = ({ roomTypeFilter, setRoomTypeFilter }) => {
  const router = useRouter();
  const [capacity, setCapacity] = useState('all');
  const [guests, setGuests] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleRoomTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRoomTypeFilter(event.target.value);
  };

  // Monta a URL com todos os filtros e navega para a página de acomodações
  const handleFilterClick = () => {
    router.push(
      `/rooms?roomType=${roomTypeFilter}&capacity=${capacity}&guests=${guests}&minPrice=${minPrice}&maxPrice=${maxPrice}`,
    );
  };

  return (
    <section className='bg-tertiary-light px-6 md:px-10 py-6 rounded-lg mt-8'>
      <div className='container mx-auto flex flex-col gap-4'>
        {/* Linha de filtros */}
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
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

          {/* Filtro por número de camas */}
          <div>
            <label className='block text-sm font-medium mb-2 text-black'>
              Número de Camas
            </label>
            <select
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className='w-full px-4 py-2 rounded leading-tight dark:bg-black focus:outline-none'
            >
              <option value='all'>Todas</option>
              <option value='1'>1 cama</option>
              <option value='2'>2 camas</option>
              <option value='3'>3 camas</option>
              <option value='4'>4 camas</option>
              <option value='5'>5 camas</option>
              <option value='6'>6 camas</option>
              <option value='7'>7 camas</option>
              <option value='8'>8 camas</option>
            </select>
          </div>

          {/* Filtro por número de hóspedes */}
          <div>
            <label className='block text-sm font-medium mb-2 text-black'>
              Número de Hóspedes
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              className='w-full px-4 py-2 rounded leading-tight dark:bg-black focus:outline-none'
            >
              <option value='all'>Todos</option>
              <option value='1'>1 hóspede</option>
              <option value='2'>2 hóspedes</option>
              <option value='3'>3 hóspedes</option>
              <option value='4'>4 hóspedes</option>
              <option value='5'>5 hóspedes</option>
              <option value='6'>6 hóspedes</option>
              <option value='7'>7 hóspedes</option>
              <option value='8'>8 hóspedes</option>
              <option value='9'>9 hóspedes</option>
              <option value='10'>10 hóspedes</option>
              <option value='11'>11 hóspedes</option>
              <option value='12'>12 hóspedes</option>
              <option value='13'>13 hóspedes</option>
              <option value='14'>14 hóspedes</option>
              <option value='15'>15 hóspedes</option>
              <option value='16'>16 hóspedes</option>
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
        </div>

        {/* Botão de pesquisa — largura total abaixo dos filtros */}
        <button
          className='btn-primary mx-auto block px-16'
          type='button'
          onClick={handleFilterClick}
        >
          Pesquisar
        </button>
      </div>
    </section>
  );
};

export default Search;
