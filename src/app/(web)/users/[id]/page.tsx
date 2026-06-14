'use client';

import useSWR from 'swr';
import { FaSignOutAlt, FaUserCircle, FaCamera } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

import { getUserBookings, getUserReviews } from '@/libs/apis';
import { User } from '@/models/user';
import LoadingSpinner from '../../loading';
import { useRef, useState } from 'react';
import { BsJournalBookmarkFill, BsStarFill } from 'react-icons/bs';
import { GiMoneyStack } from 'react-icons/gi';
import Table from '@/components/Table/Table';
import Chart from '@/components/Chart/Chart';
import RatingModal from '@/components/RatingModal/RatingModal';
import BackDrop from '@/components/BackDrop/BackDrop';
import toast from 'react-hot-toast';

const UserDetails = (props: { params: { id: string } }) => {
  const {
    params: { id: userId },
  } = props;

  const [currentNav, setCurrentNav] = useState<
    'bookings' | 'amount' | 'ratings'
  >('bookings');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [isRatingVisible, setIsRatingVisible] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [ratingValue, setRatingValue] = useState<number | null>(0);
  const [ratingText, setRatingText] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null);
  const [cancelTermsAccepted, setCancelTermsAccepted] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/users/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Falha no upload');

      const { imageUrl } = await res.json();
      setUploadedImage(imageUrl);
      toast.success('Foto atualizada com sucesso!');
    } catch {
      toast.error('Erro ao atualizar foto');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const toggleRatingModal = () => setIsRatingVisible(prevState => !prevState);

  const reviewSubmitHandler = async () => {
    if (!ratingText.trim().length || !ratingValue) {
      return toast.error('Preencha o texto e a nota da avaliação');
    }

    if (!roomId) toast.error('ID do quarto não encontrado');

    setIsSubmittingReview(true);

    try {
      const { data } = await axios.post('/api/users', {
        reviewText: ratingText,
        ratingValue,
        roomId,
      });

      console.log(data);
      toast.success('Avaliação enviada com sucesso!');
      mutateReviews();
    } catch (error) {
      console.log(error);
      toast.error('Falha ao enviar avaliação');
    } finally {
      setRatingText('');
      setRatingValue(null);
      setRoomId(null);
      setIsSubmittingReview(false);
      setIsRatingVisible(false);
    }
  };

  const fetchUserBooking = async () => getUserBookings(userId);

  const fetchUserReviews = async () => getUserReviews(userId);

  const fetchUserData = async () => {
    const { data } = await axios.get<User>('/api/users');
    return data;
  };

  const {
    data: userBookings,
    isLoading,
    mutate: mutateBookings,
  } = useSWR('/api/room-bookings', fetchUserBooking);

  const {
    data: userReviews,
    mutate: mutateReviews,
  } = useSWR(`/api/user-reviews-${userId}`, fetchUserReviews);

  const cancelBookingHandler = (bookingId: string) => {
    setCancelTermsAccepted(false);
    setBookingToCancel(bookingId);
  };

  const confirmCancelHandler = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);
    try {
      const res = await fetch('/api/cancel-booking', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bookingToCancel }),
      });
      if (!res.ok) {
        const msg = await res.text();
        toast.error(msg || 'Erro ao cancelar reserva');
      } else {
        toast.success('Reserva cancelada com sucesso!');
        mutateBookings();
      }
    } catch {
      toast.error('Erro ao cancelar reserva');
    } finally {
      setIsCancelling(false);
      setBookingToCancel(null);
    }
  };

  const {
    data: userData,
    isLoading: loadingUserData,
  } = useSWR('/api/users', fetchUserData);

  if (loadingUserData || isLoading) return <LoadingSpinner />;

  if (!userData) {
    return (
      <div className="p-10 text-center">
        Não foi possível carregar os dados do usuário.
      </div>
    );
  }

  const safeBookings = userBookings || [];
  const safeReviews = userReviews || [];
  const totalSpent = safeBookings.reduce((sum, b) => sum + b.totalPrice, 0);

  const avatarSrc = uploadedImage || (typeof userData.image === 'string' && userData.image ? userData.image : null);

  const AvatarDisplay = ({ size }: { size: number }) => (
    <div
      className='relative mx-auto mb-5 rounded-full overflow-hidden cursor-pointer group'
      style={{ width: size, height: size }}
      onClick={() => fileInputRef.current?.click()}
      title='Clique para trocar a foto'
    >
      {avatarSrc ? (
        <Image
          src={avatarSrc}
          alt={userData.name || 'User'}
          width={size}
          height={size}
          className='object-cover w-full h-full rounded-full scale-animation'
        />
      ) : (
        <FaUserCircle className='w-full h-full text-gray-400' style={{ width: size, height: size }} />
      )}

      {/* overlay ao hover */}
      <div className='absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
        {isUploadingImage ? (
          <span className='text-white text-xs'>Enviando...</span>
        ) : (
          <FaCamera className='text-white text-2xl' />
        )}
      </div>
    </div>
  );

  return (
    <div className='container mx-auto px-2 md:px-4 py-10'>
      {/* Input de arquivo oculto */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleImageUpload}
      />

      <div className='grid md:grid-cols-12 gap-10'>

        <div className='hidden md:block md:col-span-4 lg:col-span-3 h-fit sticky top-10 rounded-xl overflow-hidden shadow-lg'>
          <div className='bg-[#46220f] h-2' />
          <div className='bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-5'>
            <AvatarDisplay size={120} />

            <h6 className='text-lg font-bold text-center mb-1'>{userData.name}</h6>
            <p className='text-xs text-center text-gray-500 dark:text-gray-400 mb-4'>
              Membro desde {new Date(userData._createdAt).toLocaleDateString('pt-BR')}
            </p>

            <hr className='border-gray-200 dark:border-gray-700 my-3' />

            {userData.about && (
              <div className='mb-4'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>Sobre</p>
                <p className='text-sm text-gray-600 dark:text-gray-300'>{userData.about}</p>
              </div>
            )}

            <div className='grid grid-cols-2 gap-3 my-4'>
              <div className='bg-amber-50 dark:bg-gray-700 rounded-lg p-3 text-center'>
                <p className='text-2xl font-bold text-[#46220f] dark:text-amber-400'>{safeBookings.length}</p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>Reservas</p>
              </div>
              <div className='bg-amber-50 dark:bg-gray-700 rounded-lg p-3 text-center'>
                <p className='text-2xl font-bold text-[#46220f] dark:text-amber-400'>{safeReviews.length}</p>
                <p className='text-xs text-gray-500 dark:text-gray-400'>Avaliações</p>
              </div>
            </div>

            <hr className='border-gray-200 dark:border-gray-700 my-3' />

            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='flex items-center gap-2 w-full text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition-colors text-sm py-1'
            >
              <FaSignOutAlt />
              Sair da conta
            </button>
          </div>
        </div>

        <div className='md:col-span-8 lg:col-span-9'>
          <div className='flex flex-col mb-2'>
            <h5 className='text-3xl font-bold text-gray-800 dark:text-white'>
              Olá, {userData.name} 👋
            </h5>
            <p className='text-sm text-gray-400 dark:text-gray-400 mt-1'>
              Membro desde {new Date(userData._createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className='md:hidden mb-3 flex items-center gap-4'>
            <AvatarDisplay size={56} />
            <div>
              {userData.about && <p className='text-sm text-gray-600 dark:text-gray-300'>{userData.about}</p>}
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className='flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors mt-1'
              >
                <FaSignOutAlt className='text-base' />
                Sair
              </button>
            </div>
          </div>

          <nav className='sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 rounded-lg mt-7 mb-8 shadow-sm overflow-hidden'>
            <div className='flex items-center overflow-x-auto'>
              <button
                onClick={() => setCurrentNav('bookings')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  currentNav === 'bookings'
                    ? 'border-[#46220f] text-[#46220f] dark:text-amber-400 dark:border-amber-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <BsJournalBookmarkFill />
                Reservas Atuais
                {safeBookings.length > 0 && (
                  <span className='bg-[#46220f] dark:bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none'>
                    {safeBookings.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentNav('amount')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  currentNav === 'amount'
                    ? 'border-[#46220f] text-[#46220f] dark:text-amber-400 dark:border-amber-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <GiMoneyStack />
                Valor Gasto
              </button>

              <button
                onClick={() => setCurrentNav('ratings')}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  currentNav === 'ratings'
                    ? 'border-[#46220f] text-[#46220f] dark:text-amber-400 dark:border-amber-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <BsStarFill className='text-yellow-500' />
                Minhas Avaliações
                {safeReviews.length > 0 && (
                  <span className='bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center leading-none'>
                    {safeReviews.length}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {currentNav === 'bookings' ? (
            <Table
              bookingDetails={safeBookings}
              setRoomId={setRoomId}
              toggleRatingModal={toggleRatingModal}
              onCancelBooking={cancelBookingHandler}
            />
          ) : null}

          {currentNav === 'ratings' ? (
            <div>
              {safeReviews.length === 0 ? (
                <div className='text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700'>
                  <BsStarFill className='text-5xl text-gray-200 dark:text-gray-600 mx-auto mb-4' />
                  <p className='text-gray-500 dark:text-gray-300 font-medium'>Você ainda não avaliou nenhuma acomodação.</p>
                  <p className='text-sm text-gray-400 dark:text-gray-400 mt-1'>Avalie suas hospedagens na aba “Reservas Atuais”.</p>
                </div>
              ) : (
                <div className='flex flex-col gap-4'>
                  {safeReviews.map(review => (
                    <div key={review._id} className='bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5'>
                      <div className='flex items-start justify-between mb-3'>
                        <Link
                          href={`/rooms/${review.hotelRoom.slug.current}`}
                          className='font-semibold text-[#46220f] dark:text-amber-400 hover:underline text-sm'
                        >
                          {review.hotelRoom.name}
                        </Link>
                        <div className='flex gap-0.5'>
                          {[1,2,3,4,5].map(s => (
                            <BsStarFill
                              key={s}
                              className={`text-base ${s <= review.userRating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className='text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>{review.text}</p>
                      <p className='text-xs text-gray-400 dark:text-gray-500 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700'>
                        Avaliado em {new Date(review._createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {currentNav === 'amount' ? (
            <>
              <div className='mb-6 bg-[#46220f] text-white rounded-xl p-6 flex items-center justify-between shadow-md'>
                <div>
                  <p className='text-sm opacity-80 mb-1'>Total investido em hospedagens</p>
                  <p className='text-3xl font-bold'>
                    R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <p className='text-xs opacity-60 mt-1'>{safeBookings.length} reservas realizadas</p>
                </div>
                <GiMoneyStack className='text-6xl opacity-20' />
              </div>
              <Chart userBookings={safeBookings} />
            </>
          ) : null}
        </div>
      </div>

      {bookingToCancel && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-black bg-opacity-50' onClick={() => setBookingToCancel(null)} />
          <div className='relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6'>
            <h3 className='text-lg font-bold text-gray-800 dark:text-white mb-3'>Cancelar Reserva</h3>

            <div className='bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed'>
              <p className='font-semibold text-amber-800 dark:text-amber-400 mb-2'>Política de Cancelamento</p>
              <p>O cancelamento de reservas é permitido somente com <strong>antecedência mínima de 5 dias</strong> em relação à data de entrada.</p>
              <p className='mt-2'>Caso a solicitação seja feita dentro desse período, o cancelamento <strong>não será aceito</strong> e a reserva permanecerá ativa.</p>
            </div>

            <label className='flex items-start gap-3 cursor-pointer mb-5'>
              <input
                type='checkbox'
                checked={cancelTermsAccepted}
                onChange={e => setCancelTermsAccepted(e.target.checked)}
                className='mt-0.5 w-4 h-4 accent-[#46220f] cursor-pointer'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Concordo com os termos aplicados e desejo prosseguir com o cancelamento.
              </span>
            </label>

            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setBookingToCancel(null)}
                className='px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
              >
                Voltar
              </button>
              <button
                onClick={confirmCancelHandler}
                disabled={!cancelTermsAccepted || isCancelling}
                className='px-4 py-2 text-sm rounded-lg bg-red-500 text-white font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-600 enabled:hover:bg-red-600'
              >
                {isCancelling ? 'Cancelando...' : 'Confirmar cancelamento'}
              </button>
            </div>
          </div>
        </div>
      )}

      <RatingModal
        isOpen={isRatingVisible}
        ratingValue={ratingValue}
        setRatingValue={setRatingValue}
        ratingText={ratingText}
        setRatingText={setRatingText}
        isSubmittingReview={isSubmittingReview}
        reviewSubmitHandler={reviewSubmitHandler}
        toggleRatingModal={toggleRatingModal}
      />

      <BackDrop isOpen={isRatingVisible} />
    </div>
  );
};

export default UserDetails;