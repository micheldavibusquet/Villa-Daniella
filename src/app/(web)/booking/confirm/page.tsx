'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

type Status = 'loading' | 'success' | 'error';

function BookingConfirmContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const userId = searchParams.get('userId');

  const [status, setStatus] = useState<Status>('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [bookingInfo, setBookingInfo] = useState<{
    checkinDate: string;
    checkoutDate: string;
    numberOfDays: string;
    totalPrice: string;
  } | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setErrorMsg('Sessão de pagamento inválida.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setBookingInfo({
            checkinDate: data.checkinDate,
            checkoutDate: data.checkoutDate,
            numberOfDays: data.numberOfDays,
            totalPrice: data.totalPrice,
          });
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(data.error || 'Pagamento não confirmado. Tente novamente.');
        }
      } catch {
        setStatus('error');
        setErrorMsg('Erro ao verificar pagamento. Tente novamente.');
      }
    };

    verify();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <div className='w-12 h-12 border-4 border-[#46220f] border-t-transparent rounded-full animate-spin' />
        <p className='text-gray-600 text-lg'>Verificando pagamento...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
        <div className='bg-white border border-red-200 rounded-2xl shadow-lg p-10 max-w-md w-full text-center'>
          <div className='text-6xl mb-4'>❌</div>
          <h2 className='text-2xl font-bold text-red-700 mb-3'>Pagamento não realizado</h2>
          <p className='text-gray-600 mb-6'>{errorMsg}</p>
          <p className='text-sm text-gray-400 mb-8'>
            Nenhuma reserva foi criada. Verifique os dados do cartão e tente novamente.
          </p>
          <Link href='/rooms' className='btn-primary inline-block'>
            Tentar novamente
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
      <div className='bg-white border border-green-200 rounded-2xl shadow-lg p-10 max-w-md w-full text-center'>
        <div className='text-6xl mb-4'>✅</div>
        <h2 className='text-2xl font-bold text-green-700 mb-3'>Reserva confirmada!</h2>
        <p className='text-gray-600 mb-6'>
          Seu pagamento foi processado com sucesso e sua reserva está garantida.
        </p>

        {bookingInfo && (
          <div className='bg-gray-50 rounded-xl p-4 text-left mb-6 text-sm'>
            <div className='flex justify-between py-1 border-b border-gray-200'>
              <span className='text-gray-500'>Check-in</span>
              <span className='font-medium'>{bookingInfo.checkinDate}</span>
            </div>
            <div className='flex justify-between py-1 border-b border-gray-200'>
              <span className='text-gray-500'>Check-out</span>
              <span className='font-medium'>{bookingInfo.checkoutDate}</span>
            </div>
            <div className='flex justify-between py-1 border-b border-gray-200'>
              <span className='text-gray-500'>Diárias</span>
              <span className='font-medium'>{bookingInfo.numberOfDays}</span>
            </div>
            <div className='flex justify-between py-1'>
              <span className='text-gray-500'>Total pago</span>
              <span className='font-bold text-[#46220f]'>R$ {bookingInfo.totalPrice}</span>
            </div>
          </div>
        )}

        <Link
          href={userId ? `/users/${userId}` : '/'}
          className='btn-primary inline-block'
        >
          Ver minhas reservas
        </Link>
      </div>
    </div>
  );
}

export default function BookingConfirmPage() {
  return (
    <Suspense fallback={
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <div className='w-12 h-12 border-4 border-[#46220f] border-t-transparent rounded-full animate-spin' />
        <p className='text-gray-600 text-lg'>Carregando...</p>
      </div>
    }>
      <BookingConfirmContent />
    </Suspense>
  );
}
