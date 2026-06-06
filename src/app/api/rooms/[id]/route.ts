import { NextResponse } from 'next/server';
import { adminClient } from '@/libs/sanity';

// PATCH /api/rooms/[id] — atualiza acomodacao
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const { id } = params;

    const {
      name,
      description,
      type,
      price,
      maxGuests,
      numberOfBeds,
      coverImageAssetId,
      removeCover,
      addGalleryAssetIds,
      removeGalleryKeys,
    } = body;

    let patch = adminClient.patch(id);

    if (name) patch = patch.set({ name });
    if (description !== undefined) patch = patch.set({ description });
    if (type) patch = patch.set({ type });
    if (price) patch = patch.set({ price: Number(price) });
    if (maxGuests) patch = patch.set({ dimension: Number(maxGuests) });
    if (numberOfBeds) patch = patch.set({ numberOfBeds: Number(numberOfBeds) });

    // Troca ou remove a foto de capa
    if (removeCover) {
      patch = patch.unset(['coverImage']);
    } else if (coverImageAssetId) {
      patch = patch.set({
        coverImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: coverImageAssetId },
        },
      });
    }

    // Remove fotos da galeria
    if (removeGalleryKeys && removeGalleryKeys.length > 0) {
      patch = patch.unset(
        removeGalleryKeys.map((key: string) => `images[_key == "${key}"]`),
      );
    }

    // Adiciona fotos na galeria
    if (addGalleryAssetIds && addGalleryAssetIds.length > 0) {
      const newImages = addGalleryAssetIds.map(
        (assetId: string, i: number) => ({
          _type: 'image',
          _key: `img_${Date.now()}_${i}`,
          asset: { _type: 'reference', _ref: assetId },
        }),
      );
      patch = patch.setIfMissing({ images: [] }).append('images', newImages);
    }

    const updated = await patch.commit();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar acomodacao' },
      { status: 500 },
    );
  }
}

// DELETE /api/rooms/[id] — exclui acomodacao
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  try {
    await adminClient.delete(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir acomodacao' },
      { status: 500 },
    );
  }
}
