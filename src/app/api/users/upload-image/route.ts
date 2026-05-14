import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/libs/auth';
import { adminClient } from '@/libs/sanity';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Autenticação Requerida', { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new NextResponse('Arquivo não enviado', { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const asset = await adminClient.assets.upload('image', buffer, {
      filename: file.name,
      contentType: file.type,
    });

    const imageUrl = asset.url;

    // Atualiza o documento do usuário no Sanity
    await adminClient
      .patch(session.user.id)
      .set({ image: imageUrl })
      .commit();

    return NextResponse.json({ imageUrl }, { status: 200 });
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    return new NextResponse('Erro ao fazer upload da imagem', { status: 500 });
  }
}
