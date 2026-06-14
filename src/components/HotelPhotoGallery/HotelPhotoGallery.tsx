'use client';

import { useState } from "react";
import Image from "next/image";

type Photo = {
  url?: string;
};

export default function HotelPhotoGallery({ photos }: { photos: Photo[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!photos || photos.length === 0) return null;

  const getUrl = (photo: Photo) => photo?.url || "/placeholder.jpg";

  const goPrev = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? photos.length - 1 : (prev as number) - 1
    );
  };

  const goNext = () => {
    setSelectedIndex((prev) =>
      prev === photos.length - 1 ? 0 : (prev as number) + 1
    );
  };

  return (
    <div className="container mx-auto">

      {/* FOTO PRINCIPAL */}
      <div
        className="w-full h-[520px] overflow-hidden rounded-xl mb-4 cursor-pointer"
        onClick={() => setSelectedIndex(0)}
      >
        <Image
          src={getUrl(photos[0])}
          alt="Foto principal"
          width={1200}
          height={800}
          className="w-full h-full object-cover"
        />
      </div>

      {/* MINIATURAS */}
      <div className="flex gap-3 flex-wrap">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="w-24 h-24 overflow-hidden rounded-lg cursor-pointer"
            onClick={() => setSelectedIndex(index)}
          >
            <Image
              src={getUrl(photo)}
              alt={`Foto ${index}`}
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* MODAL COM NAVEGAÇÃO */}
      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">

          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute top-5 right-5 text-white text-3xl z-50"
          >
            ✕
          </button>

          {/* SETA ESQUERDA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            className="absolute left-5 text-white text-4xl z-50"
          >
            ‹
          </button>

          {/* IMAGEM */}
          <div
            className="max-w-5xl w-full px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={getUrl(photos[selectedIndex])}
              alt="Foto ampliada"
              width={1600}
              height={1000}
              className="w-full h-auto rounded-xl"
            />
          </div>

          {/* SETA DIREITA */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            className="absolute right-5 text-white text-4xl z-50"
          >
            ›
          </button>

          {/* FECHAR AO CLICAR FORA */}
          <div
            className="absolute inset-0"
            onClick={() => setSelectedIndex(null)}
          />
        </div>
      )}
    </div>
  );
}