'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import bgImg from "../../../../public/bg-dashboard.jpg";

import api from '@/app/axios';
import Navbar from "@/components/navbar";
import Footer from '@/components/footer';
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
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ArticlesContent />
    </Suspense>
  );
}

function ArticlesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 9;

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [listCategories, setListCategories] = useState<Category[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const getArticlesData = async (
    currentPage: number, 
    limit: number, 
    search = '', 
    category = ''
  ) => {
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      
      if (search) params.append('title', search);
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

  const getUserData = async () => {
    try {
      const response = await api.get('/auth/profile');
      console.log(response);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    }
  };

  useEffect(() => {
    getCategoriesList();
    getUserData();
  }, []);

  useEffect(() => {
    getArticlesData(page, pageSize, searchQuery, selectedCategory);
  }, [page, pageSize, searchQuery, selectedCategory]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    const urlCategory = searchParams.get('category') || '';
    setSearchQuery(urlSearch);
    setSelectedCategory(urlCategory);
  }, [searchParams]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', pageSize.toString());
    if (value) params.set('search', value);
    if (selectedCategory) params.set('category', selectedCategory);
    router.replace(`?${params.toString()}`);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value);
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', pageSize.toString());
    if (searchQuery) params.set('search', searchQuery);
    if (value) params.set('category', value);
    router.replace(`?${params.toString()}`);
  };

  return (
    <>
      <div className="h-full bg-white">
        <div 
          className="w-full h-[500px] bg-cover bg-center" 
          style={{ backgroundImage: `url(${bgImg.src})` }}
        >
          <div className="bg-[#2563EBDB]/[86%] w-full h-full">
            <Navbar isDarkMode={true}/>
            <div className="h-max flex flex-col items-center justify-center text-center px-20 py-10 space-y-4">
              <h3 className="text-white font-semibold">Blog genzet</h3>
              <h1 className="text-white text-4xl md:text-5xl font-bold max-w-4xl">
                The Journal : Design Resources, Interviews, and Industry News
              </h1>
              <h2 className="text-white text-xl">Your daily dose of design insights!</h2>

              {/* Search & Filter */}
              <div className="flex justify-center space-x-4 w-full max-w-3xl mt-6 bg-[#3B82F6] p-2 rounded-md">
                <select
                  className="p-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select category</option>
                  {listCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  className="flex-grow p-2 rounded-md border border-gray-300 text-gray-700 bg-white"
                  placeholder="Search articles"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-20 py-20">
          <p className="pb-5 text-gray-700">
            Showing: {pageSize} of {totalArticles} articles
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
            {articles.length === 0 ? (
              <p>No articles available.</p>
            ) : (
              articles.map(article => (
                <Link 
                  key={article.id} 
                  className="bg-white overflow-hidden h-[432px] rounded-md shadow-md hover:shadow-lg transition-shadow"
                  href={`/user/articles/${article.id}`}
                >
                  <Image
                    src={article.imageUrl}
                    alt={article.title}
                    width={387}
                    height={240}
                    className="object-cover w-[387px] h-[240px] text-black rounded-t-md"
                  />
                  <div className="h-[176px] py-5 flex flex-col justify-between px-4">
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(article.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <h4 className="text-xl font-bold text-[#0F172A]">
                        {wordLimitation(article.title, 20)}
                      </h4>
                      <div
                        className="prose text-[#475569]"
                        dangerouslySetInnerHTML={{ __html: wordLimitation(article.content, 100) }}
                      />
                    </div>
                    <p className="text-sm text-[#1E3A8A] bg-[#BFDBFE] w-fit px-4 py-1 rounded-2xl "> 
                      {wordLimitation(article.category?.name || 'Unknown', 10) || 'Unknown'}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          <PaginationWithLinks
            page={page}
            pageSize={pageSize}
            totalCount={totalArticles} 
            // pageSizeSelectOptions={{
            //   pageSizeOptions: [5, 10, 25, 50],
            // }}
            />
        </div>
          <Footer/>
      </div>
    </>
  );
}
