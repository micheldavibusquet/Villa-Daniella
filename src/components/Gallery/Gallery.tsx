import Image from 'next/image';

const Gallery = () => {
  return (
    // px-6 md:px-10 → padding lateral que faltava
    <div className='container mx-auto py-14 px-6 md:px-10'>
      <div className='flex flex-wrap'>
        {/* LADO ESQUERDO */}
        <div className='flex w-1/2 flex-wrap'>
          <div className='w-1/2 p-1 md:p-2 h-48'>
            <Image
              alt='Villa Daniella'
              className='object-cover w-full h-full'
              src='/images/casa_pe_na_areia_1.webp'
              width={649}
              height={408}
            />
          </div>

          <div className='w-1/2 p-1 md:p-2 h-48'>
            <Image
              alt='Villa Daniella'
              className='object-cover w-full h-full'
              src='/images/casa_pe_na_areia_3.webp'
              width={649}
              height={408}
            />
          </div>

          <div className='w-full p-1 md:p-2 h-48'>
            <Image
              alt='Villa Daniella'
              className='object-cover w-full h-full'
              src='/images/casa_pe_na_areia_4.webp'
              width={649}
              height={408}
            />
          </div>
        </div>

        {/* LADO DIREITO */}
        <div className='flex w-1/2 flex-wrap'>
          {/* Imagem corrigida — estava sem src, height e className */}
          <div className='w-full p-1 md:p-2 h-48'>
            <Image
              alt='Villa Daniella'
              className='object-cover w-full h-full'
              src='/images/casa_pe_na_areia_2.webp'
              width={974}
              height={408}
            />
          </div>

          <div className='w-1/2 p-1 md:p-2 h-48'>
            <Image
              alt='Villa Daniella'
              className='object-cover w-full h-full'
              src='/images/area_externa_villa_santuario.webp'
              width={649}
              height={408}
            />
          </div>

          <div className='w-1/2 p-1 md:p-2 h-48'>
            <Image
              alt='Villa Daniella'
              className='object-cover w-full h-full'
              src='/images/casa_pe_na_areia_5.webp'
              width={649}
              height={408}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Gallery;
