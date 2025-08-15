'use client'
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams} from 'next/navigation';

import bgImg from "../../../../public/bg-dashboard.jpg";
import api from '@/app/axios';
import Navbar from "@/components/navbar";
import Footer from '@/components/footer';
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";

import { Select, SelectTrigger, SelectValue ,SelectContent, SelectGroup,SelectLabel, SelectItem} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Heart, HeartOff } from 'lucide-react';
import { useDarkMode } from '@/app/hooks/darkMode';
import { useFavorites } from '@/app/stores/favoriteArticles';
import { Button } from '@/components/ui/button';

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
  
  const searchParams = useSearchParams();
  const { isDarkMode} = useDarkMode();
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 9;

  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [listCategories, setListCategories] = useState<Category[]>([]);
  const { toggle, isFavorited } = useFavorites();
  
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const [categoryValue, setCategoryValue] = useState("")
  const debounceRef = useRef<number | null>(null);

  const handleSearchDebounced = (query:string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = window.setTimeout(() => {
            getArticlesData(page, pageSize, query, categoryValue);
        }, 500);
    };

    const handleFavoriteClick = (
    e: React.MouseEvent,
    article: Article
  ) => {
    e.preventDefault();
    e.stopPropagation();
    toggle({
      id: article.id,
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl,
      createdAt:article.createdAt,
      category: article.category?.name ?? 'Unknown'
    });
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
    getArticlesData(page, pageSize, debouncedSearchValue, categoryValue);
  }, [page, pageSize, debouncedSearchValue, categoryValue]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={`h-full ${isDarkMode ? 'bg-neutral-900':'bg-white'}`}>
        <div 
          className="w-full h-[850px]  sm:h-[500px] bg-cover bg-center" 
          style={{ backgroundImage: `url(${bgImg.src})` }}
        >
          <div className={`${isDarkMode ? 'bg-[#0F172A]/[86%]':'bg-[#2563EBDB]/[86%]'}  w-full h-full`}>
            <Navbar/>
            <div className="sm:h-max h-full flex flex-col items-center justify-center text-center px-20 sm:pb-10  space-y-4">
              <h3 className={`text-white font-semibold`}>Blog genzet</h3>
              <h1 className={`text-white text-4xl md:text-5xl font-bold max-w-4xl`}>
                The Journal : Design Resources, Interviews, and Industry News
              </h1>
              <h2 className="text-white text-base sm:text-xl">Your daily dose of design insights!</h2>

              {/* Search & Filter */}
              <div className={` ${isDarkMode?'bg-slate-900':'bg-[#3B82F6]'} flex justify-center items-center flex-col sm:flex-row  gap-3 space-x-4 w-full max-w-3xl mt-6  p-2 rounded-md`}>
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

                <input
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
            </div>
          </div>
        </div>

        <div className="px-20 py-20">
          <p className={` ${isDarkMode?'text-white':'text-gray-700'} pb-5 text-gray-700`}>
            Showing: {pageSize} of {totalArticles} articles
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-10 gap-8 h-full">
            {articles.length === 0 ? (
              <p>No articles available.</p>
            ) : (
              articles.map(article => {
                const fav = isFavorited(article.id)
                  return(
                <Card key={article.id} className={`${isDarkMode?'bg-slate-800':'bg-white'}`} >
                  <CardContent>
                    <Link 
                      
                      className='w-full'
                      href={`/user/articles/${article.id}`}
                    >
                      {article.imageUrl ? (
                        <Image
                          src={article.imageUrl}
                          alt={article.title}
                          width={387}
                          height={240}
                          className="object-cover w-[387px] h-[240px] text-black rounded-t-md"
                        />
                      ) : (
                        <div className="w-full h-[240px] object-cover bg-gray-300 rounded-t-md"></div> // Placeholder for missing image
                      )}
                      <div className="h-[176px] py-5 flex flex-col gap-2 justify-between px-4">
                        <div>
                          <p className={`text-sm ${isDarkMode ?'text-white':'text-[#475569]'}`}>
                            {new Date(article.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </p>
                          <h4 className={`${isDarkMode ?'text-white':'text-[#0F172A]'} text-xl font-bold `}>
                            {wordLimitation(article.title, 20)}
                          </h4>
                          <div
                            className={` ${isDarkMode ?'text-white':'text-[#475569]'} prose `}
                            dangerouslySetInnerHTML={{ __html: wordLimitation(article.content, 70) }}
                          />
                        </div>
                        <p className="text-sm text-[#1E3A8A] bg-[#BFDBFE] w-fit px-4 py-1 rounded-2xl "> 
                          {wordLimitation(article.category?.name || 'Unknown', 10) || 'Unknown'}
                        </p>
                      </div>
                    </Link>
                        <Button
                        onClick={(e) => handleFavoriteClick(e, article)}
                        className='w-10'
                        >
                          {fav?<HeartOff/>:<Heart/>}
                        </Button>
                  </CardContent>
                </Card>
                
              )})
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
    </Suspense>
  );
}
