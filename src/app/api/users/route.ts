import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/libs/auth';
import { adminClient } from '@/libs/sanity';
import {
  checkReviewExists,
  createReview,
  getUserData,
  updateReview,
} from '@/libs/apis';

export async function GET(req: Request, res: Response) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Autenticação Requerida', { status: 500 });
  }

  const userId = session.user.id;

  try {
    const data = await getUserData(userId);
    return NextResponse.json(data, { status: 200, statusText: 'Realizada com sucesso' });
  } catch (error) {
    return new NextResponse('Não foi possível obter o recurso', { status: 400 });
  }
}

export async function POST(req: Request, res: Response) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Autenticação Requerida', { status: 500 });
  }

  const { roomId, reviewText, ratingValue } = await req.json();

  if (!roomId || !reviewText || !ratingValue) {
    return new NextResponse('Todos os campos são requeridos', { status: 400 });
  }

  const userId = session.user.id;

  try {
    const alreadyExists = await checkReviewExists(userId, roomId);

    let data;

    if (alreadyExists) {
      data = await updateReview({
        reviewId: alreadyExists._id,
        reviewText,
        userRating: ratingValue,
      });
    } else {
      data = await createReview({
        hotelRoomId: roomId,
        reviewText,
        userId,
        userRating: ratingValue,
      });
    }

    return NextResponse.json(data, { status: 200, statusText: 'Realizada com sucesso' });
  } catch (error: any) {
    console.log('Erro na atualização', error);
    return new NextResponse('Impossibilitado de criar avaliação', { status: 400 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Autenticação Requerida', { status: 401 });
  }

  const { imageUrl } = await req.json();

  if (!imageUrl) {
    return new NextResponse('URL da imagem não fornecida', { status: 400 });
  }

  try {
    await adminClient
      .patch(session.user.id)
      .set({ image: imageUrl })
      .commit();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar imagem:', error);
    return new NextResponse('Erro ao atualizar imagem', { status: 500 });
  }
}
