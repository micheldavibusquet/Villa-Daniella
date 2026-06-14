# Substituição do fluxo de pagamento Stripe por pagamento simulado (mock)

Preciso substituir o fluxo de pagamento via Stripe por um fluxo de pagamento simulado (mock),
onde qualquer dado de cartão informado resulta em sucesso e a reserva é criada para o usuário logado.

O projeto é um hotel em Next.js com Sanity como banco de dados e NextAuth para autenticação.

---

## 1. Corrija o bug em `src/libs/apis.ts`

Na função `createBooking`, troque `client.create(` por `adminClient.create(`.
O `client` é o cliente público do Sanity (sem token, sem permissão de escrita).
O `adminClient` usa o `SANITY_API_TOKEN` e tem permissão de escrita.

---

## 2. Crie o arquivo `src/app/api/mock-payment/route.ts`

Esse endpoint recebe os dados da reserva, busca o quarto pelo slug, cria a reserva no Sanity
via `createBooking` e marca o quarto como ocupado via `updateHotelRoom`.
Usa a sessão do NextAuth para identificar o usuário — nenhum dado de cartão é validado.

```ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { createBooking, getRoom, updateHotelRoom } from '@/libs/apis';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  const {
    roomSlug, checkinDate, checkoutDate,
    adults, children, numberOfDays, totalPrice, discount,
  } = await req.json();

  if (!roomSlug || !checkinDate || !checkoutDate || !numberOfDays) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  const room = await getRoom(roomSlug);

  if (!room) {
    return NextResponse.json({ error: 'Quarto não encontrado' }, { status: 404 });
  }

  await createBooking({
    adults: Number(adults),
    checkinDate,
    checkoutDate,
    children: Number(children),
    hotelRoom: room._id,
    numberOfDays: Number(numberOfDays),
    discount: Number(discount ?? 0),
    totalPrice: Number(totalPrice),
    user: session.user.id,
  });

  await updateHotelRoom(room._id);

  return NextResponse.json({ success: true, userId: session.user.id });
}
```

---

## 3. Crie o arquivo `src/app/(web)/payment/page.tsx`

Página visual de pagamento com dois painéis:
- **Esquerda:** resumo da reserva (nome do quarto, datas, diárias, taxa de serviço, total)
- **Direita:** formulário com campos E-mail, Número do cartão, MM/AA, CVC, Nome do titular, País

Ao clicar em "Pagar":
- Valida apenas que os campos estão preenchidos (qualquer valor funciona)
- Chama `POST /api/mock-payment` com os dados da reserva vindos da URL
- Em caso de sucesso, redireciona para `/booking/confirm?session_id=bypass&checkinDate=...&checkoutDate=...&numberOfDays=...&totalPrice=...&userId=...`

Os parâmetros da reserva chegam via query string na URL:
`roomSlug`, `roomName`, `checkinDate`, `checkoutDate`, `adults`, `children`,
`numberOfDays`, `subtotal`, `serviceFee`, `totalPrice`, `discount`, `pricePerDay`

O componente deve ser envolvido em `<Suspense>` pois usa `useSearchParams`.

---

## 4. Modifique `src/app/(web)/rooms/[slug]/page.tsx`

- Remova os imports: `axios`, `getStripe` (de `@/libs/stripe`)
- Adicione o import: `useRouter` de `next/navigation`
- Adicione `const router = useRouter()` dentro do componente
- Substitua toda a função `handleBookNowClick` pela versão abaixo,
  que calcula os preços localmente e redireciona para `/payment` em vez de chamar o Stripe:

```ts
const handleBookNowClick = () => {
  if (!room) return;

  if (!checkinDate || !checkoutDate)
    return toast.error('Por favor, informe as datas');

  if (checkinDate > checkoutDate)
    return toast.error('Data de checkout inválida');

  const numberOfDays = calcNumDays();

  if (numberOfDays < 2)
    return toast.error('Mínimo de 2 diárias');

  const discount = room.discount || 0;
  const pricePerDay = room.price - (room.price / 100) * discount;
  const subtotal = pricePerDay * numberOfDays;
  const serviceFee = Math.round(subtotal * 0.1);
  const totalPrice = subtotal + serviceFee;

  const params = new URLSearchParams({
    roomSlug: room.slug.current,
    roomName: room.name,
    checkinDate: checkinDate.toISOString().split('T')[0],
    checkoutDate: checkoutDate.toISOString().split('T')[0],
    adults: String(adults),
    children: String(noOfChildren),
    numberOfDays: String(numberOfDays),
    subtotal: String(subtotal),
    serviceFee: String(serviceFee),
    totalPrice: String(totalPrice),
    discount: String(discount),
    pricePerDay: String(pricePerDay),
  });

  router.push(`/payment?${params.toString()}`);
};
```

---

## Contexto adicional

A página `/booking/confirm` já possui suporte ao modo bypass:
quando `session_id === 'bypass'`, ela lê os dados diretamente dos parâmetros da URL
e exibe a confirmação sem chamar nenhuma API do Stripe. Não é necessário alterar essa página.

O fluxo completo após as alterações:

1. Usuário seleciona datas e clica em **"RESERVAR"** → redireciona para `/payment`
2. Preenche qualquer dado no formulário e clica em **"Pagar"**
3. `POST /api/mock-payment` cria a reserva no Sanity para o usuário logado
4. Redireciona para `/booking/confirm` com os dados da reserva na URL
5. Página de confirmação exibe o resumo da reserva com sucesso
