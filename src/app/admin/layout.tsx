'use client'

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/sidebar';
import NavbarAdmin from '@/components/navbarAdmin';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();


  const isPreviewPage = pathname.startsWith('/admin/articles/preview');
if (isPreviewPage) {
    return <>{children}</>;
  }
  return (
    <div className="flex flex-row h-full min-h-screen">
      <Sidebar />
      <div className="w-full flex flex-col">
        <NavbarAdmin />
        <main className="h-fit w-full bg-[#F3F4F6] p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
