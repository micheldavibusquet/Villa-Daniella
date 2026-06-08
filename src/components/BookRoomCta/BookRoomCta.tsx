'use client';

import { Dispatch, FC, SetStateAction } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
  checkinDate: Date | null;
  setCheckinDate: Dispatch<SetStateAction<Date | null>>;
  checkoutDate: Date | null;
  setCheckoutDate: Dispatch<SetStateAction<Date | null>>;
  setAdults: Dispatch<SetStateAction<number>>;
  setNoOfChildren: Dispatch<SetStateAction<number>>;
  calcMinCheckoutDate: () => Date | null;
  price: number;
  discount: number;
  adults: number;
  noOfChildren: number;
  specialNote: string;
  isBooked: boolean;
  bookedDates: Date[];
  handleBookNowClick: () => void;
};

const BookRoomCta: FC<Props> = props => {
  const {
    price,
    discount,
    specialNote,
    checkinDate,
    setCheckinDate,
    checkoutDate,
    setCheckoutDate,
    calcMinCheckoutDate,
    setAdults,
    setNoOfChildren,
    adults,
    noOfChildren,
    isBooked,
    bookedDates,
    handleBookNowClick,
  } = props;

  const discountPrice = price - (price / 100) * discount;

  const calcNoOfDays = () => {
    if (!checkinDate || !checkoutDate) return 0;

    const timeDiff = checkoutDate.getTime() - checkinDate.getTime();
    const noOfDays = Math.ceil(timeDiff / (24 * 60 * 60 * 1000));

    return noOfDays;
  };

  return (
    <div className='px-7 py-6 dark:text-gray-100'>
      <h3>
        <span className='text-sm text-gray-500 dark:text-gray-400 block mb-1'>Valor da diária</span>
        <span
          className={`${discount ? 'text-gray-400 dark:text-gray-500' : 'dark:text-white'} font-bold text-xl`}
        >
          R$ {price}
        </span>

        {discount ? (
          <span className='font-bold text-xl'>
            {' '}
            | desconto {discount}%. Já{' '}
            <span className='text-tertiary-dark'>R$ {discountPrice}</span>
          </span>
        ) : null}
      </h3>

      <div className='w-full border-b-2 border-b-secondary my-2' />

      <h4 className='my-8 dark:text-gray-200'>{specialNote}</h4>

      <p className='text-xs text-gray-500 dark:text-gray-400 mb-2'>Mínimo de 2 diárias</p>

      <div className='flex'>
        <div className='w-1/2 pr-2'>
          <label
            htmlFor='check-in-date'
            className='block text-sm font-medium text-gray-900 dark:text-gray-200'
          >
            Data checkin
          </label>

          <DatePicker
            selected={checkinDate}
            onChange={(date: Date | null) => setCheckinDate(date)}
            dateFormat='dd/MM/yyyy'
            minDate={new Date()}
            excludeDates={bookedDates}
            id='check-in-date'
            className='w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white'
          />
        </div>

        <div className='w-1/2 pl-2'>
          <label
            htmlFor='check-out-date'
            className='block text-sm font-medium text-gray-900 dark:text-gray-200'
          >
            Data checkout
          </label>

          <DatePicker
            selected={checkoutDate}
            onChange={(date: Date | null) => setCheckoutDate(date)}
            dateFormat='dd/MM/yyyy'
            disabled={!checkinDate}
            minDate={calcMinCheckoutDate()}
            excludeDates={bookedDates}
            id='check-out-date'
            className='w-full border text-black border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white'
          />
        </div>
      </div>

      <div className='flex mt-4'>
        <div className='w-1/2 pr-2'>
          <label
            htmlFor='adults'
            className='block text-sm font-medium text-gray-900 dark:text-gray-200'
          >
            Adultos
          </label>

          <input
            type='number'
            id='adults'
            value={adults}
            onChange={e => setAdults(+e.target.value)}
            min={1}
            max={5}
            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2.5'
          />
        </div>

        <div className='w-1/2 pl-2'>
          <label
            htmlFor='children'
            className='block text-sm font-medium text-gray-900 dark:text-gray-200'
          >
            Crianças
          </label>

          <input
            type='number'
            id='children'
            value={noOfChildren}
            onChange={e => setNoOfChildren(+e.target.value)}
            min={0}
            max={3}
            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2.5'
          />
        </div>
      </div>

      {calcNoOfDays() > 0 && (
        <div className='mt-4 px-4 py-3 bg-[#46220f] text-white rounded-lg flex justify-between items-center'>
          <span className='text-sm font-medium'>Valor total</span>
          <span className='text-xl font-bold'>R$ {calcNoOfDays() * discountPrice}</span>
        </div>
      )}

      <button
        disabled={isBooked}
        onClick={handleBookNowClick}
        className='btn-primary w-full mt-6 disabled:bg-red-400 disabled:cursor-not-allowed'
      >
        {isBooked ? 'Datas indisponíveis' : 'RESERVAR'}
      </button>
    </div>
  );
};

export default BookRoomCta;