'use client';

import Link from 'next/link';
import { useContext } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { MdDarkMode, MdOutlineLightMode } from 'react-icons/md';
import ThemeContext from '@/context/themeContext';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const Header = () => {
  const { darkTheme, setDarkTheme } = useContext(ThemeContext);
  const { data: session } = useSession();
  const router = useRouter();

  const { data: userData } = useSWR(
    session?.user ? '/api/users' : null,
    fetcher,
  );

  const profileImage = userData?.image || session?.user?.image;

  const handleScrollToFooter = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const footerElement = document.querySelector('footer');
    footerElement?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
<header className='flex items-center justify-between px-10 py-4 w-full border-b border-gray-100 dark:border-gray-800 dark:bg-gray-900'>
      {/* LOGO */}
      <div className='flex items-center'>
        <Link href='/'>
          <Image
            src='/images/logo.png'
            alt='Logo da pousada'
            width={200}
            height={200}
            className='h-24 w-auto object-contain'
            priority
          />
        </Link>
      </div>

      {/* MENU */}
      <ul className='flex items-center gap-8 text-lg'>
        <li className='hover:-translate-y-1 duration-300 transition-all'>
          <Link href='/'>Início</Link>
        </li>

        <li className='hover:-translate-y-1 duration-300 transition-all'>
          <Link href='/rooms'>Acomodações</Link>
        </li>

        <li className='hover:-translate-y-1 duration-300 transition-all'>
          <a href='#footer' onClick={handleScrollToFooter}>
            Contato
          </a>
        </li>

        {/* Painel Admin — visível apenas para administradores */}
        {userData?.isAdmin && (
          <li className='hover:-translate-y-1 duration-300 transition-all'>
            <Link
              href='/admin'
              className='font-medium border-b-2 border-primary pb-0.5'
            >
              Painel Admin
            </Link>
          </li>
        )}

        {/* USER + DARKMODE */}

        <li className='flex items-center gap-3'>
          {session?.user ? (
            <div className='flex items-center gap-2'>
              <Link href={`/users/${session.user.id}`}>
                {profileImage ? (
                  <div className='w-10 h-10 rounded-full overflow-hidden'>
                    <Image
                      src={profileImage}
                      alt={session.user.name!}
                      width={40}
                      height={40}
                      className='object-cover w-full h-full'
                    />
                  </div>
                ) : (
                  <FaUserCircle className='cursor-pointer text-xl' />
                )}
              </Link>
              <span className='text-sm font-medium hidden md:block'>
                {session.user.name?.split(' ')[0]}
              </span>

              {/* Botão sair */}
              <button onClick={() => signOut()} className='text-sm underline'>
                Sair
              </button>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Link
                href='/auth/signin'
                className='hover:-translate-y-1 duration-300 transition-all'
              >
                <FaUserCircle className='text-xl' />
              </Link>
              <Link
                href='/auth/signin'
                className='text-sm hover:-translate-y-1 duration-300 transition-all'
              >
                Entrar
              </Link>
            </div>
          )}

          {darkTheme ? (
            <MdOutlineLightMode
              className='cursor-pointer text-xl'
              onClick={() => {
                setDarkTheme(false);
                localStorage.removeItem('hotel-theme');
              }}
            />
          ) : (
            <MdDarkMode
              className='cursor-pointer text-xl'
              onClick={() => {
                setDarkTheme(true);
                localStorage.setItem('hotel-theme', 'true');
              }}
            />
          )}
        </li>
      </ul>
    </header>
  );
};

export default Header;
