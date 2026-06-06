'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getRooms } from '@/libs/apis';
import { Room } from '@/models/room';
import RoomCard from '@/components/RoomCard/RoomCard';

/**
 * Página de listagem de acomodações.
 * Lê os filtros da URL e aplica na lista retornada pelo Sanity.
 *
 * Parâmetros suportados:
 * - roomType: filtra pelo tipo de acomodação
 * - capacity: filtra pelo número mínimo de camas (numberOfBeds >= N)
 * - guests: filtra pelo número de hóspedes (dimension >= N)
 * - minPrice: filtra pelo preço mínimo por noite
 * - maxPrice: filtra pelo preço máximo por noite
 */
export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const searchParams = useSearchParams();

  const roomType = searchParams.get('roomType') || 'all';
  const capacity = searchParams.get('capacity') || 'all';
  const guests = searchParams.get('guests') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const data = await getRooms();
        setRooms(data || []);
      } catch (error) {
        console.error('Erro ao buscar quartos:', error);
      }
    };
    fetchRooms();
  }, []);

  // Aplica todos os filtros combinados
  const filteredRooms = rooms.filter((room) => {
    // Filtro por tipo de acomodação
    const matchesType = roomType === 'all' || room.type === roomType;

    // Filtro por número mínimo de camas
    const matchesCapacity =
      capacity === 'all' || (room.numberOfBeds ?? 0) >= Number(capacity);

    // Filtro por número de hóspedes (dimension = maxGuests no Sanity)
    const matchesGuests =
      guests === 'all' || (Number(room.dimension) || 0) >= Number(guests);

    // Filtro por faixa de preço
    const matchesPrice =
      (minPrice ? room.price >= Number(minPrice) : true) &&
      (maxPrice ? room.price <= Number(maxPrice) : true);

    return matchesType && matchesCapacity && matchesGuests && matchesPrice;
  });

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-semibold mb-6'>Acomodações</h1>

      {filteredRooms.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {filteredRooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      ) : (
        <p className='text-center py-10 text-gray-500'>
          Nenhuma acomodação encontrada com os filtros selecionados.
        </p>
      )}
    </div>
  );
}
