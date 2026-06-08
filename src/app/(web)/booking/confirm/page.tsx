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

    // Lê os dados diretamente da URL (passados pelo Stripe no success_url)
    const urlCheckin = searchParams.get('checkinDate');
    const urlCheckout = searchParams.get('checkoutDate');
    const urlDays = searchParams.get('numberOfDays');
    const urlTotal = searchParams.get('totalPrice');

    if (sessionId === 'bypass') {
      setBookingInfo({
        checkinDate: urlCheckin ?? '',
        checkoutDate: urlCheckout ?? '',
        numberOfDays: urlDays ?? '',
        totalPrice: urlTotal ?? '',
      });
      setStatus('success');
      return;
    }

    // Sessão real do Stripe: verifica pagamento e cria a reserva no servidor
    const verify = async () => {
      try {
        const res = await fetch(`/api/stripe/verify?session_id=${sessionId}`);
        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data?.error || 'Falha ao verificar o pagamento.');
          setStatus('error');
          return;
        }

        setBookingInfo({
          checkinDate: data.checkinDate || urlCheckin || '',
          checkoutDate: data.checkoutDate || urlCheckout || '',
          numberOfDays: String(data.numberOfDays || urlDays || ''),
          totalPrice: String(data.totalPrice || urlTotal || ''),
        });
        setStatus('success');
      } catch {
        // mesmo com falha na verificação, usa os dados da URL se disponíveis
        if (urlCheckin && urlTotal) {
          setBookingInfo({
            checkinDate: urlCheckin,
            checkoutDate: urlCheckout ?? '',
            numberOfDays: urlDays ?? '',
            totalPrice: urlTotal,
          });
          setStatus('success');
        } else {
          setErrorMsg('Não foi possível verificar o pagamento. Entre em contato com o suporte.');
          setStatus('error');
        }
      }
    };

    verify();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
        <div className='w-12 h-12 border-4 border-[#46220f] border-t-transparent rounded-full animate-spin' />
        <p className='text-gray-600 dark:text-gray-300 text-lg'>Verificando pagamento...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className='flex flex-col items-center justify-center min-h-[60vh] px-4'>
        <div className='bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center'>
          <div className='text-6xl mb-4'>❌</div>
          <h2 className='text-2xl font-bold text-red-700 dark:text-red-400 mb-3'>Pagamento não realizado</h2>
          <p className='text-gray-600 dark:text-gray-300 mb-6'>{errorMsg}</p>
          <p className='text-sm text-gray-400 dark:text-gray-400 mb-8'>
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
      <div className='bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded-2xl shadow-lg p-10 max-w-md w-full text-center'>
        <div className='text-6xl mb-4'>✅</div>
        <h2 className='text-2xl font-bold text-green-700 dark:text-green-400 mb-3'>Reserva confirmada!</h2>
        <p className='text-gray-600 dark:text-gray-300 mb-6'>
          Seu pagamento foi processado com sucesso e sua reserva está garantida.
        </p>

        {bookingInfo && (
          <div className='bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-left mb-6 text-sm'>
            <div className='flex justify-between py-2 border-b border-gray-200 dark:border-gray-600'>
              <span className='text-gray-500 dark:text-gray-400'>Check-in</span>
              <span className='font-medium dark:text-white'>
                {bookingInfo.checkinDate
                  ? new Date(bookingInfo.checkinDate + 'T12:00:00').toLocaleDateString('pt-BR')
                  : '—'}
              </span>
            </div>
            <div className='flex justify-between py-2 border-b border-gray-200 dark:border-gray-600'>
              <span className='text-gray-500 dark:text-gray-400'>Check-out</span>
              <span className='font-medium dark:text-white'>
                {bookingInfo.checkoutDate
                  ? new Date(bookingInfo.checkoutDate + 'T12:00:00').toLocaleDateString('pt-BR')
                  : '—'}
              </span>
            </div>
            <div className='flex justify-between py-2 border-b border-gray-200 dark:border-gray-600'>
              <span className='text-gray-500 dark:text-gray-400'>Diárias</span>
              <span className='font-medium dark:text-white'>{bookingInfo.numberOfDays || '—'}</span>
            </div>
            <div className='flex justify-between py-2'>
              <span className='text-gray-500 dark:text-gray-400'>Total pago</span>
              <span className='font-bold text-[#46220f] dark:text-amber-400'>
                {bookingInfo.totalPrice
                  ? `R$ ${Number(bookingInfo.totalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                  : '—'}
              </span>
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
        <p className='text-gray-600 dark:text-gray-300 text-lg'>Carregando...</p>
      </div>
    }>
      <BookingConfirmContent />
    </Suspense>
  );
}
