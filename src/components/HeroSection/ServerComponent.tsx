import Image from 'next/image';

export const heading1 = (
  <>
    <h1 className='font-heading text-5xl lg:text-6xl mb-6 leading-tight'>
      Villa Daniella <br />
      Beach Homes
    </h1>

    <div className='text-[#4a4a4a] dark:text-[#ffffffea] mb-10 max-w-lg text-lg leading-relaxed'>
      <p>
        Hospedagem exclusiva em Florianópolis, perfeita para relaxar e
        aproveitar o mar com conforto e privacidade.
      </p>

      <p className='mt-6'>
        Desfrute de acomodações selecionadas, ambientes acolhedores e uma
        localização privilegiada à beira-mar. 
      </p>

      <p className='mt-6'>
        Aqui a sua estadia se transforma em uma lembrança inesquecível.
      </p>
    </div>

    <a href="/rooms" className='btn-primary inline-block'>
      Ver acomodações
    </a>
  </>
);

export const section2 = (
  <div className='md:grid hidden gap-6 grid-cols-1 w-full'>

    {/* IMAGEM PRINCIPAL */}
    <div className='rounded-2xl overflow-hidden h-[460px]'>
      <Image
        src='/images/villa-daniella-1.webp'
        alt='Vista da Villa Daniella Beach Homes'
        width={900}
        height={900}
        className='object-cover w-full h-full hover:scale-105 transition-transform duration-500'
      />
    </div>

    {/* IMAGENS MENORES */}
    <div className='grid grid-cols-2 gap-6 h-[200px]'>

      <div className='rounded-2xl overflow-hidden'>
        <Image
          src='/images/villa-daniella-2.webp'
          alt='Interior da acomodação'
          width={500}
          height={500}
          className='object-cover w-full h-full hover:scale-105 transition-transform duration-500'
        />
      </div>

      <div className='rounded-2xl overflow-hidden'>
        <Image
          src='/images/villa-daniella-3.webp'
          alt='Área externa e jardim'
          width={500}
          height={500}
          className='object-cover w-full h-full hover:scale-105 transition-transform duration-500'
        />
      </div>

    </div>

  </div>
);
