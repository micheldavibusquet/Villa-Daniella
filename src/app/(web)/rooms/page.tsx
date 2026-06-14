'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

import { getRooms } from '@/libs/apis';
import { Room } from '@/models/room';
import RoomCard from '@/components/RoomCard/RoomCard';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);

  const searchParams = useSearchParams();

  const roomType = searchParams.get('roomType') || 'all';
  const capacity = searchParams.get('capacity') || 'all';
  const maxGuests = searchParams.get('maxGuests') || 'all';
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

  // FILTRO COMPLETO:
  // tipo + capacidade + faixa de preço
  const filteredRooms = rooms.filter((room) => {
    const matchesType = roomType === 'all' || room.type === roomType;

    const matchesCapacity =
      capacity === 'all' || (room.numberOfBeds ?? 0) >= Number(capacity);
    const matchesGuests =
      maxGuests === 'all' || (room.maxGuests ?? 0) >= Number(maxGuests);
    const matchesPrice =
      (minPrice ? room.price >= Number(minPrice) : true) &&
      (maxPrice ? room.price <= Number(maxPrice) : true);

    return matchesType && matchesCapacity && matchesGuests && matchesPrice;
  });

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <h1 className='text-2xl font-semibold mb-6 dark:text-white'>
        Acomodações
      </h1>

      {filteredRooms.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {filteredRooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      ) : (
        <p className='text-center py-10 text-gray-500 dark:text-gray-400'>
          Nenhuma acomodação encontrada.
        </p>
      )}
    </div>
  );
}
