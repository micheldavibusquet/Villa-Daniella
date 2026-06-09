'use client';

import { Dispatch, FC, SetStateAction } from 'react';
import { useRouter } from 'next/navigation';
import { BsStarFill } from 'react-icons/bs';
import { MdCancel } from 'react-icons/md';

import { Booking } from '@/models/booking';

type Props = {
  bookingDetails: Booking[];
  setRoomId: Dispatch<SetStateAction<string | null>>;
  toggleRatingModal: () => void;
  onCancelBooking?: (bookingId: string) => void;
};

const daysUntilCheckin = (checkinDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [year, month, day] = checkinDate.split('T')[0].split('-').map(Number);
  const checkin = new Date(year, month - 1, day);
  return Math.max(0, Math.ceil((checkin.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)));
};

const formatDate = (dateStr: string) =>
  new Date(dateStr.split('T')[0] + 'T12:00:00').toLocaleDateString('pt-BR');

const Table: FC<Props> = ({ bookingDetails, setRoomId, toggleRatingModal, onCancelBooking }) => {
  const router = useRouter();

  return (
    <div className='overflow-x-auto rounded-xl shadow-md'>
      <table className='w-full text-sm text-left text-gray-600 dark:text-gray-300'>
        <thead className='text-xs text-white uppercase bg-[#46220f]'>
          <tr>
            <th className='px-5 py-4 rounded-tl-xl'>Acomodação</th>
            <th className='px-5 py-4'>Valor unit.</th>
            <th className='px-5 py-4'>Preço R$</th>
            <th className='px-5 py-4'>Nº de dias reservados</th>
            <th className='px-5 py-4'>Período</th>
            <th className='px-5 py-4 rounded-tr-xl'></th>
          </tr>
        </thead>
        <tbody>
          {bookingDetails.length === 0 && (
            <tr>
              <td colSpan={6} className='px-5 py-8 text-center text-gray-400 bg-white dark:bg-gray-800'>
                Nenhuma reserva encontrada.
              </td>
            </tr>
          )}
          {bookingDetails.map((booking, idx) => {
            const remaining = daysUntilCheckin(booking.checkinDate);
            return (
              <tr
                key={booking._id}
                className={`border-b transition-colors ${
                  idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'
                } hover:bg-amber-50 dark:hover:bg-gray-700`}
              >
                <td
                  onClick={() => router.push(`/rooms/${booking.hotelRoom.slug.current}`)}
                  className='px-5 py-4 font-semibold text-[#46220f] dark:text-amber-400 underline cursor-pointer whitespace-nowrap'
                >
                  {booking.hotelRoom.name}
                </td>
                <td className='px-5 py-4 font-medium'>
                  R$ {booking.hotelRoom.price.toLocaleString('pt-BR')}
                </td>
                <td className='px-5 py-4 font-bold text-gray-800 dark:text-white'>
                  R$ {booking.totalPrice.toLocaleString('pt-BR')}
                </td>
                <td className='px-5 py-4 text-center'>{booking.numberOfDays}</td>
                <td className='px-5 py-4'>
                  <div className='flex flex-col gap-0.5 text-xs'>
                    <span className='font-semibold text-gray-700 dark:text-gray-200'>
                      Entrada: {formatDate(booking.checkinDate)}
                    </span>
                    <span className='text-gray-500 dark:text-gray-400'>
                      Saída: {formatDate(booking.checkoutDate)}
                    </span>
                    {remaining > 0 && (
                      <span className='mt-1 inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold px-2 py-0.5 rounded-full w-fit'>
                        faltam {remaining} dia{remaining === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>
                </td>
                <td className='px-5 py-4'>
                  <div className='flex flex-col gap-2'>
                    <button
                      onClick={() => {
                        setRoomId(booking.hotelRoom._id);
                        toggleRatingModal();
                      }}
                      className='flex items-center gap-1 text-xs font-semibold text-[#46220f] dark:text-amber-400 hover:text-amber-600 transition-colors'
                    >
                      <BsStarFill className='text-yellow-500' />
                      Avaliar
                    </button>
                    {onCancelBooking && (
                      <button
                        onClick={() => onCancelBooking(booking._id)}
                        className='flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors'
                      >
                        <MdCancel />
                        Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
