'use client';

import axios from 'axios';
import { FC, useEffect, useState } from 'react';

import { Review } from '@/models/review';
import Rating from '../Rating/Rating';

const RoomReview: FC<{ roomId: string }> = ({ roomId }) => {
  const [roomReviews, setRoomReviews] = useState<Review[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get<Review[]>(
          `/api/room-reviews/${roomId}`
        );
        setRoomReviews(data);
      } catch {
        setError(true);
      }
    };

    fetchReviews();
  }, [roomId]);

  if (error) return null;

  if (roomReviews.length === 0) {
    return (
      <p className='text-sm text-gray-400 dark:text-gray-300 italic py-2'>
        Nenhuma avaliação ainda. Seja o primeiro a avaliar!
      </p>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {roomReviews.map(review => (
        <div
          className='bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-xl shadow-sm'
          key={review._id}
        >
          <div className='flex items-center justify-between mb-2'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 rounded-full bg-[#46220f] flex items-center justify-center text-white font-bold text-sm'>
                {review.user.name?.charAt(0).toUpperCase()}
              </div>
              <p className='font-semibold text-gray-800 dark:text-white text-sm'>{review.user.name}</p>
            </div>
            <div className='flex items-center gap-1 text-tertiary-light'>
              <Rating rating={review.userRating} />
            </div>
          </div>

          <p className='text-sm text-gray-600 dark:text-gray-300 leading-relaxed mt-2'>{review.text}</p>

          {review._createdAt && (
            <p className='text-xs text-gray-400 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700'>
              {new Date(review._createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default RoomReview;