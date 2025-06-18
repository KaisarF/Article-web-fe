'use client'

import Image from 'next/image';
import Link from 'next/link';
import {usePathname, useRouter} from 'next/navigation';
import articleLogo from '@/../public/articleLogo.svg'
import categoriesLogo from '@/../public/categoriesLogo.svg'
import logoutLogo from '@/../public/logoutLogo.svg'
import logoLight from '@/../public/logoipsum-light.svg'
import Swal from 'sweetalert2';
import Cookies from 'js-cookie';
export default function Sidebar(){
    const pathname = usePathname();
    const router = useRouter()
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
          Cookies.remove('role')
          Cookies.remove('password')
          router.push('/login') 
        }
      });
    };
    return(
        <aside className='w-3/12 bg-[#2563EB] flex flex-col px-10 pt-15 text-white gap-10'>
        <Image
        src={logoLight}
        alt='logo light'
        width={200}
        />
        <Link href={'/admin/articles'} className={`flex flex-row gap-2 px-4 py-2 rounded-sm text-xl ${
          pathname === '/admin/articles' ? 'bg-[#3B82F6]' : ''
        }`}>
          <Image
          src={articleLogo}
          alt='articles logo'
          width={30}
          height={30}
          />
          <p>articles</p></Link>
        <Link href={'/admin/categories'} className={`flex flex-row gap-2 px-4 py-2 rounded-sm text-xl ${
          pathname === '/admin/categories' ? 'bg-[#3B82F6]' : ''
        }`}>
          <Image
          src={categoriesLogo}
          alt='categories logo'
          width={30}
          height={30}
          />
          Category</Link>
        <p onClick={logout} className='flex flex-row gap-2 px-4 py-2 rounded-sm text-xl'>
          <Image
          src={logoutLogo}
          alt='logout logo'
          width={30}
          height={30}
          
          />
          logout</p>

      </aside>
    )
}