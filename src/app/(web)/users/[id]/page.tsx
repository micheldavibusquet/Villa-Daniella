'use client';

import useSWR from 'swr';
import { FaSignOutAlt, FaUserCircle, FaCamera } from 'react-icons/fa';
import Image from 'next/image';
import axios from 'axios';
import { signOut } from 'next-auth/react';

import { getUserBookings } from '@/libs/apis';
import { User } from '@/models/user';
import LoadingSpinner from '../../loading';
import { useRef, useState } from 'react';
import { BsJournalBookmarkFill } from 'react-icons/bs';
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

  const fetchUserData = async () => {
    const { data } = await axios.get<User>('/api/users');
    return data;
  };

  const {
    data: userBookings,
    error,
    isLoading,
  } = useSWR('/api/room-bookings', fetchUserBooking);

  const {
    data: userData,
    isLoading: loadingUserData,
    error: errorGettingUserData,
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

        <div className='hidden md:block md:col-span-4 lg:col-span-3 shadow-lg h-fit sticky top-10 bg-[#eff0f2] text-black rounded-lg px-6 py-4'>
          <AvatarDisplay size={143} />

          <div className='font-normal py-4 text-left'>
            <h6 className='text-xl font-bold pb-3'>Sobre</h6>
            <p className='text-sm'>{userData.about ?? ''}</p>
          </div>

          <div className='font-normal text-left'>
            <h6 className='text-xl font-bold pb-3'>{userData.name}</h6>
          </div>

          <div className='flex items-center'>
            <p className='mr-2'>Sair</p>
            <FaSignOutAlt
              className='text-3xl cursor-pointer'
              onClick={() => signOut({ callbackUrl: '/' })}
            />
          </div>
        </div>

        <div className='md:col-span-8 lg:col-span-9'>
          <div className='flex items-center'>
            <h5 className='text-2xl font-bold mr-3'>
              Olá, {userData.name}
            </h5>
          </div>

          <div className='md:hidden mb-3'>
            <AvatarDisplay size={56} />
          </div>

          <p className='block w-fit md:hidden text-sm py-2'>
            {userData.about ?? ''}
          </p>

          <p className='text-xs py-2 font-medium'>
            Membro desde {userData._createdAt.split('T')[0]}
          </p>

          <div className='md:hidden flex items-center my-2'>
            <p className='mr-2'>Sair</p>
            <FaSignOutAlt
              className='text-3xl cursor-pointer'
              onClick={() => signOut({ callbackUrl: '/' })}
            />
          </div>

          <nav className='sticky top-0 px-2 w-fit mx-auto md:w-full md:px-5 py-3 mb-8 text-gray-700 border border-gray-200 rounded-lg bg-gray-50 mt-7'>
            <ol
              className={`${
                currentNav === 'bookings'
                  ? 'text-blue-600'
                  : 'text-gray-700'
              } inline-flex mr-1 md:mr-5 items-center space-x-1 md:space-x-3`}
            >
              <li
                onClick={() => setCurrentNav('bookings')}
                className='inline-flex items-center cursor-pointer'
              >
                <BsJournalBookmarkFill />
                <a className='inline-flex items-center mx-1 md:mx-3 text-xs md:text-sm font-medium'>
                  Reservas Atuais
                </a>
              </li>
            </ol>

            <ol
              className={`${
                currentNav === 'amount'
                  ? 'text-blue-600'
                  : 'text-gray-700'
              } inline-flex mr-1 md:mr-5 items-center space-x-1 md:space-x-3`}
            >
              <li
                onClick={() => setCurrentNav('amount')}
                className='inline-flex items-center cursor-pointer'
              >
                <GiMoneyStack />
                <a className='inline-flex items-center mx-1 md:mx-3 text-xs md:text-sm font-medium'>
                  Valor Gasto
                </a>
              </li>
            </ol>
          </nav>

          {currentNav === 'bookings' ? (
            <Table
              bookingDetails={safeBookings}
              setRoomId={setRoomId}
              toggleRatingModal={toggleRatingModal}
            />
          ) : null}

          {currentNav === 'amount' ? (
            <Chart userBookings={safeBookings} />
          ) : null}
        </div>
      </div>

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