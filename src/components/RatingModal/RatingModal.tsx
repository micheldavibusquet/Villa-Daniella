import { Dispatch, FC, SetStateAction } from 'react';
import { BsStarFill } from 'react-icons/bs';

type Props = {
  isOpen: boolean;
  ratingValue: number | null;
  setRatingValue: Dispatch<SetStateAction<number | null>>;
  ratingText: string;
  setRatingText: Dispatch<SetStateAction<string>>;
  reviewSubmitHandler: () => Promise<string | undefined>;
  isSubmittingReview: boolean;
  toggleRatingModal: () => void;
};

const RatingModal: FC<Props> = props => {
  const {
    isOpen,
    ratingValue,
    setRatingValue,
    ratingText,
    setRatingText,
    reviewSubmitHandler,
    isSubmittingReview,
    toggleRatingModal,
  } = props;

  const starValues = [1, 2, 3, 4, 5];

  return (
    <div
      className={`fixed z-[61] inset-0 flex items-center justify-center ${
        isOpen
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className='bg-white dark:bg-gray-800 w-96 p-4 rounded-lg shadow-lg'>
        <h2 className='text-xl text-gray-800 dark:text-white font-semibold mb-2'>
        Avalie a sua experiência
        </h2>
        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
          Avaliação
          </label>
          <div className='flex items-center'>
            {starValues.map(value => (
              <button
                className={`w-6 h-6 ${
                  ratingValue !== null && ratingValue >= value ? 'text-yellow-500' : 'text-gray-300'
                }`}
                onClick={() => setRatingValue(value)}
                key={value}
              >
                <BsStarFill />
              </button>
            ))}
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-200'>
          Texto de avaliação
          </label>

          <textarea
            value={ratingText}
            onChange={e => setRatingText(e.target.value)}
            rows={4}
            className='w-full px-2 py-3 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400'
          ></textarea>
        </div>

        <div className='flex justify-end'>
          <button
            onClick={reviewSubmitHandler}
            className='px-4 py-2 bg-primary text-white rounded-md'
            disabled={isSubmittingReview}
          >
            {isSubmittingReview ? 'Enviando...' : 'Avaliar'}
          </button>
          <button
            onClick={toggleRatingModal}
            className='ml-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500'
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
