'use client'
import Image from 'next/image';
import logoDark from '../../public/logoIpsum.svg';
import logoLight from '../../public/logoipsum-light.svg';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import api from '@/app/axios';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
import { useDarkMode } from '@/app/hooks/darkMode';
import { Eclipse } from 'lucide-react';
import { Button } from './ui/button';
import { HeartFilledIcon } from '@radix-ui/react-icons';
interface UserData {
  id: string | number;
  username: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { isDarkMode, setIsDarkMode } = useDarkMode();
  const modalRef = useRef<HTMLDivElement>(null);

  const toggleDarkMode = () => {
        setIsDarkMode(prev => !prev);
    };

  const getUserData = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUserData(response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
      }
    };
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal]);

  const initial = userData?.username.charAt(0).toUpperCase() || '';
  
  const logout = () => {
    Swal.fire({
      title: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        Cookies.remove('token');
    Cookies.remove('role');
    Cookies.remove('password');
        router.push('/login');
      }
    });
  };

  const isPreviewPage = pathname.startsWith('/admin/articles/preview');

  const handleUsernameClick = () => {
    if (isPreviewPage) {
      router.push('/admin/profile');
    } else {
      setShowModal(!showModal);
    }
  };

  const handleLogoClick = ()=>{
    if (isPreviewPage) {
      router.push('/admin/articles');
    } else {
      router.push('/user/articles');
    }
  }

  return (
    <div className=" pt-5 w-full h-24 flex flex-row justify-between px-5 md:px-20 sm:px-10 items-center relative">
      {isDarkMode ? (
        <Image onClick={handleLogoClick} src={logoLight} alt="logo ipsum" className="" />
      ) : (
        <Image onClick={handleLogoClick} src={logoDark} alt="logo ipsum" className="" />
      )}
      <div className="flex flex-row gap-4 justify-center items-center relative">
        <Link href={'/user/articles/favoriteArticles'}>
          <Button variant={'destructive'}>
            <HeartFilledIcon/> favorite 
          </Button>
        </Link>
        
        {isDarkMode ?(
          <Button variant={"outline"} onClick={toggleDarkMode} >
          <Eclipse /> LightMode
        </Button>
        ):(
        <Button  onClick={toggleDarkMode} >
          <Eclipse /> DarkMode
        </Button>
        )}
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
          {initial}
        </div>
        
        {/* <<< DIUBAH: Gunakan handler yang baru dibuat */}
        <p
          onClick={handleUsernameClick} 
          className={isDarkMode ?  'underline text-gray-100 cursor-pointer':'underline text-neutral-300 cursor-pointer'}
        >
          {userData ? userData.username : 'Loading...'}
        </p>

        {/* Modal hanya akan ditampilkan jika tidak di halaman preview, karena klik akan navigasi */}
        {showModal && !isPreviewPage && (
          <div
            ref={modalRef}
            className="absolute top-full right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-50"
          >
            <ul className="py-2 text-sm text-gray-700">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                
                <Link href='/user/profile'>My Account</Link>
              </li>
              <li onClick={logout} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">Log out</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}