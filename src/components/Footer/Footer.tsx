'use client';

import Link from 'next/link';
import { BsFillSendFill, BsTelephoneOutbound } from 'react-icons/bs';
import { BiMessageDetail } from 'react-icons/bi';
import { AiOutlineInstagram } from 'react-icons/ai';

const Footer = () => {

  const handleComingSoon = () => {
    alert('Em breve!');
  };

  return (
    <footer className='mt-16 dark:bg-gray-900 dark:border-t dark:border-gray-800'>
      <div className='container mx-auto px-4'>

        <Link href='/' className='font-black text-tertiary-dark'>
          Villa Daniella – Beach Homes
        </Link>

        <h4 className='font-semibold text-[40px] py-6 dark:text-white'>Contatos</h4>

        <div className='flex flex-wrap gap-16 items-center justify-between'>

          <div className='flex-1'>
            <p>Florianópolis - SC</p>

            <div className='flex items-center py-4'>
              <BsFillSendFill />
              <p className='ml-2 dark:text-gray-300'>contato@villadaniella.com</p>
            </div>

            <div className='flex items-center'>
              <BsTelephoneOutbound />
              <p className='ml-2 dark:text-gray-300'>+55 48 3207-7255</p>
            </div>

            <div className='flex items-center pt-4'>
              <BiMessageDetail />
              <a
                href='https://wa.me/554832077255'
                target='_blank'
                rel='noopener noreferrer'
                className='ml-2 text-green-600 hover:underline font-medium'
              >
                Atendimento via WhatsApp
              </a>
            </div>

            <div className='flex items-center pt-4'>
              <AiOutlineInstagram className='text-xl text-pink-600' />
              <a
                href='https://www.instagram.com/villadaniellafloripa/'
                target='_blank'
                rel='noopener noreferrer'
                className='ml-2 text-pink-600 hover:underline font-medium'
              >
                @villadaniellafloripa
              </a>
            </div>
          </div>

          <div className="flex-1 md:text-right">
            <p className="pb-4 font-semibold">Informações</p>

            <Link href="/rooms" className="block pb-2 hover:underline">
              Acomodações
            </Link>

            <p onClick={handleComingSoon} className="pb-2 cursor-pointer hover:underline">
              Sobre a Villa
            </p>

            <p onClick={handleComingSoon} className="pb-2 cursor-pointer hover:underline">
              Política de Privacidade
            </p>

            <p onClick={handleComingSoon} className="cursor-pointer hover:underline">
              Termos de uso
            </p>
          </div>

          <div className="flex-1 md:text-right">
            <p className='pb-4 font-semibold'>Experiência</p>

            <p onClick={handleComingSoon} className='pb-2 cursor-pointer hover:underline'>
              Frente ao mar
            </p>

            <p onClick={handleComingSoon} className='pb-2 cursor-pointer hover:underline'>
              Ambiente exclusivo
            </p>

            <p onClick={handleComingSoon} className='pb-2 cursor-pointer hover:underline'>
              Descanso e natureza
            </p>

            <p onClick={handleComingSoon} className='cursor-pointer hover:underline'>
              Hospedagem confortável
            </p>
          </div>

        </div>
      </div>

      <div className='bg-tertiary-light h-10 md:h-[70px] mt-16 w-full bottom-0 left-0' />
    </footer>
  );
};

export default Footer;