'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  return digits;
}

function toBRL(value: number) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function VisaIcon() {
  return (
    <svg viewBox="0 0 38 24" width="36" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="3" fill="#1A1F71" />
      <text x="19" y="17" textAnchor="middle" fill="white" fontSize="12" fontFamily="Arial" fontWeight="bold" letterSpacing="1">VISA</text>
    </svg>
  );
}

function MastercardIcon() {
  return (
    <svg viewBox="0 0 38 24" width="36" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect width="38" height="24" rx="3" fill="#252525" />
      <circle cx="15" cy="12" r="7" fill="#EB001B" />
      <circle cx="23" cy="12" r="7" fill="#F79E1B" />
      <path d="M19 6.8a7 7 0 0 1 0 10.4A7 7 0 0 1 19 6.8z" fill="#FF5F00" />
    </svg>
  );
}

function CvcIcon() {
  return (
    <svg viewBox="0 0 32 24" width="32" height="22" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="2" width="30" height="20" rx="3" fill="none" stroke="#9CA3AF" strokeWidth="1.5" />
      <rect x="1" y="7" width="30" height="5" fill="#9CA3AF" />
      <rect x="19" y="15" width="9" height="4" rx="1" fill="#9CA3AF" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="22" height="16" rx="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function PaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomName    = searchParams.get('roomName')    ?? '';
  const roomSlug    = searchParams.get('roomSlug')    ?? '';
  const checkinDate  = searchParams.get('checkinDate')  ?? '';
  const checkoutDate = searchParams.get('checkoutDate') ?? '';
  const adults      = searchParams.get('adults')      ?? '1';
  const children    = searchParams.get('children')    ?? '0';
  const numberOfDays = searchParams.get('numberOfDays') ?? '0';
  const subtotal    = Number(searchParams.get('subtotal')    ?? '0');
  const serviceFee  = Number(searchParams.get('serviceFee')  ?? '0');
  const totalPrice  = Number(searchParams.get('totalPrice')  ?? '0');
  const discount    = searchParams.get('discount')    ?? '0';
  const pricePerDay = Number(searchParams.get('pricePerDay') ?? '0');

  const [email,    setEmail]    = useState('');
  const [card0,    setCard0]    = useState('');
  const [card1,    setCard1]    = useState('');
  const [card2,    setCard2]    = useState('');
  const [card3,    setCard3]    = useState('');
  const [expiry,   setExpiry]   = useState('');
  const [cvc,      setCvc]      = useState('');
  const [cardName, setCardName] = useState('');
  const [country,  setCountry]  = useState('Brasil');
  const [saveInfo, setSaveInfo] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});

  const cardNumber = `${card0}${card1}${card2}${card3}`;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email.trim()) e.email = 'Informe seu e-mail';
    if (cardNumber.length < 13) e.cardNumber = 'Número do cartão inválido';
    if (expiry.replace(/\s\/\s/g, '').length < 4) e.expiry = 'Data inválida';
    if (cvc.length < 3) e.cvc = 'CVC inválido';
    if (!cardName.trim()) e.cardName = 'Informe o nome do titular';
    return e;
  };

  const handlePay = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/mock-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomSlug, checkinDate, checkoutDate, adults, children, numberOfDays, totalPrice, discount }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.error || 'Erro ao processar pagamento'); setLoading(false); return; }

      const params = new URLSearchParams({
        session_id: 'bypass', checkinDate, checkoutDate, numberOfDays,
        totalPrice: String(totalPrice), userId: data.userId ?? '',
      });
      router.push(`/booking/confirm?${params.toString()}`);
    } catch {
      alert('Erro ao processar pagamento. Tente novamente.');
      setLoading(false);
    }
  };

  const advanceFocus = (next: string) => {
    document.getElementById(next)?.focus();
  };

  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-white'>

      {/* ESQUERDA — Resumo */}
      <div className='md:w-1/2 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 px-8 py-12'>
        <div className='max-w-sm mx-auto'>
          <p className='text-sm text-gray-500 mb-1'>Pagar reserva</p>
          <p className='text-sm font-semibold text-gray-700 mb-1'>{roomName}</p>
          <p className='text-4xl font-bold text-gray-900 mb-8'>R$ {toBRL(totalPrice)}</p>

          <div className='space-y-5 text-sm'>
            <div className='flex justify-between items-start gap-4'>
              <div>
                <p className='font-medium text-gray-800'>{roomName} — Diária</p>
                <p className='text-gray-500'>Check-in: {checkinDate} → Check-out: {checkoutDate}</p>
                <p className='text-gray-500'>Qtde {numberOfDays}</p>
                <p className='text-gray-400'>R$ {toBRL(pricePerDay)} cada</p>
              </div>
              <p className='font-medium text-gray-800 whitespace-nowrap'>R$ {toBRL(subtotal)}</p>
            </div>
            <div className='border-t border-gray-200 pt-5 flex justify-between items-start gap-4'>
              <div>
                <p className='font-medium text-gray-800'>Taxa de serviço</p>
                <p className='text-gray-500'>10% sobre o valor das diárias</p>
                <p className='text-gray-500'>Qtde 1</p>
              </div>
              <p className='font-medium text-gray-800 whitespace-nowrap'>R$ {toBRL(serviceFee)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* DIREITA — Formulário */}
      <div className='md:w-1/2 px-8 py-12'>
        <form autoComplete='off' onSubmit={e => e.preventDefault()} className='max-w-sm mx-auto space-y-5'>

          {/* Dados para contato */}
          <div>
            <p className='text-base font-semibold text-gray-900 mb-3'>Dados para contato</p>
            <label htmlFor='pay-email' className='block text-sm text-gray-700 mb-1'>E-mail</label>
            <input
              id='pay-email'
              type='text'
              placeholder='e-mail@exemplo.com'
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              className={`w-full border rounded-md px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
              autoComplete='off'
            />
            {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
          </div>

          {/* Forma de pagamento */}
          <div>
            <p className='text-base font-semibold text-gray-900 mb-3'>Forma de pagamento</p>

            <div className={`border rounded-lg overflow-hidden ${errors.cardNumber || errors.expiry || errors.cvc ? 'border-red-400' : 'border-gray-300'}`}>

              {/* Cabeçalho Cartão */}
              <div className='flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200'>
                <CardIcon />
                <span className='text-sm font-medium text-gray-800'>Cartão</span>
              </div>

              {/* Dados do cartão */}
              <div className='px-4 pt-3 pb-3'>
                <p className='text-xs text-gray-500 mb-2'>Dados do cartão</p>

                <div className='border border-gray-300 rounded-md overflow-hidden'>
                  {/* Número do cartão — 4 inputs separados para evitar detecção do Chrome */}
                  <div className='flex items-center px-3 py-2.5 border-b border-gray-300 gap-1'>
                    <input id='cn0' type='text' inputMode='numeric' placeholder='0000' value={card0} maxLength={4}
                      onChange={e => { const v = e.target.value.replace(/\D/g,'').slice(0,4); setCard0(v); setErrors(p=>({...p,cardNumber:''})); if(v.length===4) advanceFocus('cn1'); }}
                      className='w-10 text-sm outline-none bg-transparent text-center' autoComplete='off' data-lpignore='true' />
                    <span className='text-gray-300 select-none'>·</span>
                    <input id='cn1' type='text' inputMode='numeric' placeholder='0000' value={card1} maxLength={4}
                      onChange={e => { const v = e.target.value.replace(/\D/g,'').slice(0,4); setCard1(v); setErrors(p=>({...p,cardNumber:''})); if(v.length===4) advanceFocus('cn2'); }}
                      className='w-10 text-sm outline-none bg-transparent text-center' autoComplete='off' data-lpignore='true' />
                    <span className='text-gray-300 select-none'>·</span>
                    <input id='cn2' type='text' inputMode='numeric' placeholder='0000' value={card2} maxLength={4}
                      onChange={e => { const v = e.target.value.replace(/\D/g,'').slice(0,4); setCard2(v); setErrors(p=>({...p,cardNumber:''})); if(v.length===4) advanceFocus('cn3'); }}
                      className='w-10 text-sm outline-none bg-transparent text-center' autoComplete='off' data-lpignore='true' />
                    <span className='text-gray-300 select-none'>·</span>
                    <input id='cn3' type='text' inputMode='numeric' placeholder='0000' value={card3} maxLength={4}
                      onChange={e => { const v = e.target.value.replace(/\D/g,'').slice(0,4); setCard3(v); setErrors(p=>({...p,cardNumber:''})); }}
                      className='w-10 text-sm outline-none bg-transparent text-center' autoComplete='off' data-lpignore='true' />
                    <div className='flex gap-1 ml-auto shrink-0'>
                      <VisaIcon />
                      <MastercardIcon />
                    </div>
                  </div>

                  {/* Validade + CVC */}
                  <div className='flex'>
                    <input type='text' placeholder='MM / AA' value={expiry}
                      onChange={e => { setExpiry(formatExpiry(e.target.value)); setErrors(p=>({...p,expiry:''})); }}
                      className='flex-1 px-3 py-2.5 text-sm outline-none bg-transparent border-r border-gray-300'
                      maxLength={7} autoComplete='off' data-lpignore='true' />
                    <div className='flex-1 flex items-center px-3 gap-2'>
                      <input type='text' placeholder='CVC' value={cvc}
                        onChange={e => { setCvc(e.target.value.replace(/\D/g,'').slice(0,4)); setErrors(p=>({...p,cvc:''})); }}
                        className='flex-1 py-2.5 text-sm outline-none bg-transparent'
                        autoComplete='off' data-lpignore='true' />
                      <CvcIcon />
                    </div>
                  </div>
                </div>

                {(errors.cardNumber || errors.expiry || errors.cvc) && (
                  <p className='text-red-500 text-xs mt-1'>{errors.cardNumber || errors.expiry || errors.cvc}</p>
                )}
              </div>

              {/* Nome do titular */}
              <div className='border-t border-gray-200 px-4 py-3'>
                <label htmlFor='card-name' className='block text-xs text-gray-500 mb-1'>Nome do titular do cartão</label>
                <input id='card-name' type='text' placeholder='Nome completo' value={cardName}
                  onChange={e => { setCardName(e.target.value); setErrors(p=>({...p,cardName:''})); }}
                  className='w-full text-sm outline-none bg-transparent py-0.5'
                  autoComplete='off' data-lpignore='true' />
                {errors.cardName && <p className='text-red-500 text-xs mt-1'>{errors.cardName}</p>}
              </div>

              {/* País ou região */}
              <div className='border-t border-gray-200 px-4 py-3'>
                <label htmlFor='card-country' className='block text-xs text-gray-500 mb-1'>País ou região</label>
                <div className='relative'>
                  <select id='card-country' value={country} onChange={e => setCountry(e.target.value)}
                    className='w-full text-sm outline-none bg-transparent appearance-none py-0.5 pr-6'>
                    <option>Brasil</option>
                    <option>Estados Unidos</option>
                    <option>Portugal</option>
                    <option>Argentina</option>
                    <option>Chile</option>
                    <option>Colômbia</option>
                  </select>
                  <svg viewBox='0 0 24 24' width='14' height='14' fill='none' stroke='#6B7280' strokeWidth='2.5'
                    className='absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none'>
                    <path d='M6 9l6 6 6-6' />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Salvar informações */}
          <div className='border border-gray-300 rounded-lg px-4 py-3'>
            <label className='flex items-start gap-3 cursor-pointer'>
              <input type='checkbox' checked={saveInfo} onChange={e => setSaveInfo(e.target.checked)}
                className='mt-0.5 h-4 w-4 rounded border-gray-300 accent-blue-600' />
              <div>
                <p className='text-sm font-medium text-gray-800'>Salve minhas informações para um checkout mais rápido</p>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Pague com segurança em {roomName || 'este hotel'} e em qualquer lugar onde a{' '}
                  <span className='text-blue-600 underline cursor-pointer'>Link</span> é aceita.
                </p>
              </div>
            </label>
          </div>

          {/* Botão */}
          <button type='button' onClick={handlePay} disabled={loading}
            className='w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-md transition-colors text-sm'>
            {loading ? 'Processando...' : 'Pagar'}
          </button>

        </form>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className='flex items-center justify-center min-h-screen'>
        <div className='w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
      </div>
    }>
      <PaymentForm />
    </Suspense>
  );
}
