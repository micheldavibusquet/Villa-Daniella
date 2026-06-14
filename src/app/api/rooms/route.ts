import { NextResponse } from 'next/server';
import { client, adminClient } from '@/libs/sanity';
import { getRoomsQuery } from '@/libs/sanityQueries';

export async function GET() {
  try {
    const rooms = await adminClient.fetch(`
  *[_type == "hotelRoom"] {
    _id,
    description,
    maxGuests,
    isBooked,
    isFeatured,
    name,
    numberOfBeds,
    price,
    slug,
    type,
    coverImage {
      url,
      "assetUrl": asset->url
    },
    "images": images[] {
      _key,
      "url": asset->url
    }
  }
`);
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Erro ao buscar acomodacoes:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      type,
      price,
      maxGuests,
      numberOfBeds,
      slug,
      isFeatured,
      isBooked,
      coverImageAssetId,
      galleryAssetIds,
    } = body;

    if (!name || !price || !numberOfBeds) {
      return NextResponse.json(
        { error: 'Campos obrigatorios: name, price, numberOfBeds' },
        { status: 400 },
      );
    }

    // Monta a foto de capa
    const coverImage = coverImageAssetId
      ? {
          _type: 'image',
          asset: { _type: 'reference', _ref: coverImageAssetId },
        }
      : null;

    // Monta a galeria de miniaturas
    const images = (galleryAssetIds ?? []).map(
      (assetId: string, i: number) => ({
        _type: 'image',
        _key: `img_${i}_${Date.now()}`,
        asset: { _type: 'reference', _ref: assetId },
      }),
    );

    const newRoom = await adminClient.create({
      _type: 'hotelRoom',
      name,
      description: description ?? '',
      type: type ?? 'basicRoom',
      price: Number(price),
      maxGuests: Number(maxGuests ?? 2),
      numberOfBeds: Number(numberOfBeds),
      slug: slug ?? {
        current: name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, ''),
      },
      isFeatured: isFeatured ?? false,
      isBooked: isBooked ?? false,
      coverImage,
      images,
      amenities: [],
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar acomodacao:', error);
    return NextResponse.json(
      { error: 'Erro ao criar acomodacao no Sanity' },
      { status: 500 },
    );
  }
}
