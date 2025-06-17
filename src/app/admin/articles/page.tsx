'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import api from '@/app/axios';

// <<< 1. Import hook useDebounce yang baru dibuat
import { useDebounce } from '@/app/hooks/useDebounce'; 

import { PaginationWithLinks } from "@/components/ui/pagination-with-links";

interface Category {
  id: string;
  name: string;
}

interface Article {
  id: string | number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  category?: {
    name: string;
  };
}

const wordLimitation = (content: string, counter: number) => {
  if (!content) return '';
  const truncated = content.slice(0, counter);
  return truncated.length === content.length ? truncated : `${truncated}...`;
};

export default function Articles() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [listCategories, setListCategories] = useState<Category[]>([]);
  
  // State untuk input pengguna secara real-time
  const [searchInput, setSearchInput] = useState<string>(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');

  // <<< 2. Gunakan hook useDebounce pada input pencarian
  // API call hanya akan terpicu setelah pengguna berhenti mengetik selama 500ms
  const debouncedSearchQuery = useDebounce(searchInput, 500);

  // Fetch articles
  const getArticlesData = async (
    currentPage: number, 
    limit: number, 
    search = '', 
    category = ''
  ) => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await api.get(`/articles?${params.toString()}`);
      setArticles(response.data.data);
      setTotalArticles(response.data.total);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      setArticles([]);
      setTotalArticles(0);
    }
  };
  
  const getCategoriesList = async() => {
    try {
      const response = await api.get('/categories');
      setListCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    getCategoriesList();
  }, []);

  // <<< 3. useEffect ini sekarang bergantung pada nilai yang sudah di-debounce
  useEffect(() => {
    // Bangun URLSearchParams baru berdasarkan state & nilai debounce
    const params = new URLSearchParams();
    params.set('page', '1'); // Selalu reset ke halaman 1 saat filter berubah
    params.set('pageSize', pageSize.toString());

    if (debouncedSearchQuery) {
      params.set('search', debouncedSearchQuery);
    }
    if (selectedCategory) {
      params.set('category', selectedCategory);
    }

    // Perbarui URL dengan `router.replace`
    router.replace(`?${params.toString()}`);
    
    // Panggil API dengan nilai yang sudah final
    getArticlesData(1, pageSize, debouncedSearchQuery, selectedCategory);

  }, [debouncedSearchQuery, selectedCategory, pageSize]); // Hanya bergantung pada nilai final

  // Handler untuk input search, hanya mengupdate state lokal
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  // Handler untuk kategori
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  return (
    <>
      <div className=" bg-white py-10">
        <p className="pb-5 px-5 text-gray-700">
          Total Articles: {totalArticles}
        </p>
        {/* <<< 4. UI disederhanakan, hapus tombol Search */}
        <div className='flex justify-between flex-row items-center p-6 border-2 border-[#E2E8F0]'>
          <div className="flex items-center space-x-4 w-full">
              <select
                className="p-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">All Categories</option>
                {listCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                className="flex-grow p-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                placeholder="Search articles by title..."
                value={searchInput}
                onChange={handleSearchChange}
              />
            </div>
            <Link className='px-4 py-2 bg-[#2563EB] rounded-md text-white whitespace-nowrap ml-4' href={'/admin/articles/add'}>
              + Add Article
            </Link>
        </div>

        {/* Tabel tidak berubah */}
        <table className="min-w-full border-collapse border border-gray-200 my-5 text-center">
          {/* ... isi tabel ... */}
          <thead>
            <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
              <th className="border-y border-gray-300 px-4 py-2 ">Thumbnails</th>
              <th className="border-y border-gray-300 px-4 py-2 ">Title</th>
              <th className="border-y border-gray-300 px-4 py-2 ">Category</th>
              <th className="border-y border-gray-300 px-4 py-2 ">Created At</th>
              <th className="border-y border-gray-300 px-4 py-2 ">Action</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">No articles found.</td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 border-b border-gray-200">
                  <td className="border-y border-gray-300 px-4 py-2 flex items-center justify-center">
                    <Image
                      src={article.imageUrl}
                      alt={article.title}
                      width={100}
                      height={100}
                      className="object-cover rounded"
                    />
                  </td>
                  <td className="border-y border-gray-300 px-4 py-2 ">{wordLimitation(article.title, 30)}</td>
                  <td className="border-y border-gray-300 px-4 py-2">{article.category?.name}</td>
                  <td className="border-y border-gray-300 px-4 py-2 whitespace-nowrap">
                    {new Date(article.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="border-y border-gray-300 px-4 py-2">
                    <div className="flex gap-4 text-sm items-center justify-center">
                      <Link href={`/admin/articles/preview/${article.id}`}>
                        <p className="text-blue-600 hover:underline">Preview</p>
                      </Link>
                      <Link href={`/admin/articles/edit/${article.id}`}>
                        <p className="text-blue-600 hover:underline">Edit</p>
                      </Link>
                      <button className="text-red-600 hover:underline cursor-pointer">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Komponen Pagination tidak perlu diubah, karena ia membaca `searchParams` dari URL */}
        <PaginationWithLinks
          page={page}
          pageSize={pageSize}
          totalCount={totalArticles} 
        />
      </div>
    </>
  );
}