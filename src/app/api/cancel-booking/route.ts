import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';
import { adminClient } from '@/libs/sanity';

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Não autorizado', { status: 401 });
  }

  try {
    const { bookingId } = await req.json();

    const booking = await adminClient.fetch(
      `*[_type == "booking" && _id == $bookingId && user._ref == $userId][0] { _id, checkinDate }`,
      { bookingId, userId: (session.user as any).id }
    );

    if (!booking) {
      return new NextResponse('Reserva não encontrada', { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [year, month, day] = booking.checkinDate.split('T')[0].split('-').map(Number);
    const checkin = new Date(year, month - 1, day);
    const daysUntilCheckin = Math.ceil(
      (checkin.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
    );

    if (daysUntilCheckin <= 5) {
      return new NextResponse(
        'Cancelamento não permitido com menos de 5 dias de antecedência',
        { status: 400 }
      );
    }

    await adminClient.delete(bookingId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return new NextResponse('Erro ao cancelar reserva', { status: 500 });
  }
}
