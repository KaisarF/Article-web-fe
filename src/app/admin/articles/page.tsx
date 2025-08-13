'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import api from '@/app/axios';
import { useDebounce } from '@/app/hooks/useDebounce'; 
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";
import { Select, SelectTrigger, SelectValue ,SelectContent, SelectGroup,SelectLabel, SelectItem} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

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

export default function Articles() {
  return (
      <Suspense fallback={<div>Loading...</div>}>
        <ArticlesContent />
      </Suspense>
    );
  }
  function ArticlesContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [articles, setArticles] = useState<Article[]>([]);
    const [totalArticles, setTotalArticles] = useState(0);
    const [listCategories, setListCategories] = useState<Category[]>([]);
    
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || 10;
  const debounceRef = useRef<number | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [categoryValue, setCategoryValue] = useState("")
  
  const handleSearchDebounced = (query:string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = window.setTimeout(() => {
            getArticlesData(page, pageSize, query, categoryValue);
        }, 500);
    };
    useEffect(() => {
    
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue]);
  

    const getArticlesData = async (
      page: number, 
      limit: number, 
      search :string, 
      category :string
    ) => {
      try {
        const queryParams = {
          title:search,
          category: category,
          page: page,
          limit: limit,
        };
        
        const response = await api.get(`/articles`,{params:queryParams});
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
    getArticlesData(page, pageSize, debouncedSearchValue, categoryValue);
  }, [page, pageSize, debouncedSearchValue, categoryValue]);



  return (
    <>
      <div className=" bg-white py-10">
        <p className="pb-5 px-5 text-gray-700">
          Total Articles: {totalArticles}
        </p>
        <div className='flex justify-between flex-row items-center p-6 border-2 border-[#E2E8F0]'>
          <div className="flex items-center space-x-4 w-full">
              <Select
                  
                  value={categoryValue}
                  onValueChange={setCategoryValue}
                >
                  <SelectTrigger 
                    className="p-2 rounded-md w-full sm:w-fit border border-gray-300 text-gray-700 bg-white">
                    <SelectValue placeholder="filter by Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel> Category </SelectLabel>
                      {listCategories.map((cat) => (
                        cat.id ? (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ) : null
                      ))}
                    </SelectGroup>
                  </SelectContent>
                  
                </Select>

              <Input
                  type="text"
                  className="sm:flex-grow w-full p-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                  placeholder="Search articles"
                  value={searchValue}
                  onChange={e => {
                    setSearchValue(e.target.value);
                    handleSearchDebounced(e.target.value);
                  }} 
                />
            </div>
            <Link className='px-4 py-2 bg-[#2563EB] rounded-md text-white whitespace-nowrap ml-4' href={'/admin/articles/add'}>
              + Add Article
            </Link>
        </div>

        <table className="min-w-full border-collapse border border-gray-200 my-5 text-center">
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

        <PaginationWithLinks
          page={page}
          pageSize={pageSize}
          totalCount={totalArticles} 
        />
      </div>
    </>
  );
}