'use client'
import Link from 'next/link';
import api from '@/app/axios';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface UserData {
  id: string | number;
  username: string;
  role: string;
}

export default function NavbarAdmin() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const pathname = usePathname();

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


  const pathSegments = pathname?.split('/').filter(Boolean); 
  const pageTitle = pathSegments?.[1] || 'Dashboard';
  const displayTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);
  const initial = userData?.username.charAt(0).toUpperCase() || '';

  return (
    <nav className='flex flex-row justify-between p-10'>
      <h1 className='text-4xl font-bold'>{displayTitle}</h1>
      <div className="flex flex-row gap-4 justify-center items-center ">
        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold text-lg">
          {initial}
        </div>
        <Link href={'/admin/profile'}>
          {userData ? userData.username : 'Loading...'}
        </Link>
      </div>
    </nav>
  );
}