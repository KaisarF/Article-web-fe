'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import api from '@/app/axios';
import { useDebounce } from '@/app/hooks/useDebounce'; 
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";

// Interface tidak berubah
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
    name:string;
  };
}

const wordLimitation = (content: string, counter: number) => {
  if (!content) return '';
  const truncated = content.slice(0, counter);
  return truncated.length === content.length ? truncated : `${truncated}...`;
};

// UBAH NAMA FUNGSI DI SINI
export default function ArticlesClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [listCategories, setListCategories] = useState<Category[]>([]);
  
  const [searchInput, setSearchInput] = useState<string>(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');

  const debouncedSearchQuery = useDebounce(searchInput, 500);

  // --- LOGIKA ANDA SUDAH BAIK ---

  useEffect(() => {
    const getArticlesData = async () => {
      try {
        const params = new URLSearchParams(searchParams.toString());
        const response = await api.get(`/articles?${params.toString()}`);
        setArticles(response.data.data);
        // Pastikan Anda menggunakan key yang benar dari respons API Anda
        setTotalArticles(response.data.totalData || response.data.total || 0);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setArticles([]);
        setTotalArticles(0);
      }
    };
    
    getArticlesData();
  }, [searchParams]);

  useEffect(() => {
    if (debouncedSearchQuery === (searchParams.get('search') || '') && selectedCategory === (searchParams.get('category') || '')) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');

    if (debouncedSearchQuery) {
      params.set('search', debouncedSearchQuery);
    } else {
      params.delete('search');
    }

    if (selectedCategory) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category');
    }
    
    router.replace(`/admin/articles?${params.toString()}`);
    
  }, [debouncedSearchQuery, selectedCategory, router, searchParams]); 


  useEffect(() => {
    const getCategoriesList = async() => {
      try {
        const response = await api.get('/categories');
        setListCategories(response.data.data);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    getCategoriesList();
  }, []);



  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;


  return (
    // ... JSX Anda sama persis, tidak perlu diubah ...
    <>
      <div className=" bg-white py-10">
        <p className="pb-5 px-5 text-gray-700">
          Total Articles: {totalArticles}
        </p>
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

        <table className="min-w-full border-collapse border border-gray-200 my-5 text-center">
          {/* ... Isi tabel ... */}
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
                      src={article.imageUrl || '/path/to/default-image.png'} // Sediakan fallback jika imageUrl null
                      alt={article.title}
                      width={100}
                      height={100}
                      className="object-cover rounded"
                      onError={(e) => { e.currentTarget.src = '/path/to/default-image.png'; }} // Fallback jika link gambar rusak
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

        <PaginationWithLinks
          page={page}
          pageSize={pageSize}
          totalCount={totalArticles} 
        />
      </div>
    </>
  );
}