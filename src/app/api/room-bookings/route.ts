import { NextResponse } from 'next/server';
import { adminClient } from '@/libs/sanity';
import { getRoomBookingsQuery } from '@/libs/sanityQueries';

// POST — usado pelo fluxo de reserva (Stripe)
export async function POST(req: Request) {
  try {
    const { roomId } = await req.json();
    const bookings = await adminClient.fetch(getRoomBookingsQuery, { roomId });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Erro ao buscar reservas do quarto:', error);
    return NextResponse.json({ message: 'error' }, { status: 500 });
  }
}

// GET — usado pela pagina publica para verificar datas ocupadas
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');

    if (!roomId) {
      return NextResponse.json(
        { message: 'roomId obrigatorio' },
        { status: 400 },
      );
    }

    const bookings = await adminClient.fetch(getRoomBookingsQuery, { roomId });
    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Erro ao buscar reservas do quarto:', error);
    return NextResponse.json({ message: 'error' }, { status: 500 });
  }
}
