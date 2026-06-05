import { NextResponse } from 'next/server';
import { client } from '@/libs/sanity';
import { getRoomsQuery } from '@/libs/sanityQueries';

// GET — lista todas as acomodações
export async function GET() {
  try {
    const rooms = await client.fetch(getRoomsQuery);
    return NextResponse.json(rooms);
  } catch (error) {
    console.error('Erro ao buscar acomodações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 },
    );
  }
}

// POST — cria nova acomodação (RF1)
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      description,
      type,
      price,
      dimension,
      numberOfBeds,
      slug,
      isFeatured,
      isBooked,
    } = body;

    if (!name || !price || !numberOfBeds) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: name, price, numberOfBeds' },
        { status: 400 },
      );
    }

    const newRoom = await client.create({
      _type: 'hotelRoom',
      name,
      description: description ?? '',
      type: type ?? 'basicRoom',
      price: Number(price),
      dimension: Number(dimension ?? 0),
      numberOfBeds: Number(numberOfBeds),
      slug: slug ?? { current: name.toLowerCase().replace(/\s+/g, '-') },
      isFeatured: isFeatured ?? false,
      isBooked: isBooked ?? false,
      coverImage: null,
      images: [],
      amenities: [],
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar acomodação:', error);
    return NextResponse.json(
      { error: 'Erro ao criar acomodação no Sanity' },
      { status: 500 },
    );
  }
}
