"use client";
import Image from 'next/image';
import Link from 'next/link';
import api from '@/app/axios';
import { useEffect, useState, useMemo} from 'react';
import React, { use } from 'react';
import Navbar from "@/components/navbar";
import Footer from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { useDarkMode } from '@/app/hooks/darkMode';
// import logoLight from '@/../public/logoipsum-light.svg';
import placeholderImage from '@/../public/uploadImg.svg';
interface Article {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  user: { username: string };
  category: { name: string };
  createdAt: string;
}

const wordLimitation = (content: string, counter: number) => {
  if (!content) return ''; // Tambahkan penjagaan jika content null/undefined
  const truncated = content.slice(0, counter);
  return truncated.length === content.length ? truncated : `${truncated}...`;
};

export default function Page({ params }: { params: Promise<{ detail: string }> }) {
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const unwrappedParams = use(params);  // this unwraps the Promise
    const detail = unwrappedParams.detail;
    const {isDarkMode} = useDarkMode()


    const [articles, setArticles] = useState<Article[]>([]);
 
    
    const getArticlesData = async () => {
        try {
        const response = await api.get(`/articles`);
        setArticles(response.data.data);

        } catch (error) {
        console.error("Failed to fetch articles:", error);

        setArticles([]);

        }
    };

    useEffect(() => {
        const getArticleDetail = async () => {
            setLoading(true);
            setError(null);
            getArticlesData()
            try {
                const response = await api.get(`/articles/${detail}`);
                setArticle(response.data);
            } catch (err) {
                setError(`Failed to fetch article data: ${err}`);
            } finally {
                setLoading(false);
            }
        };
        getArticleDetail();
    }, [detail]);

    const otherArticles = useMemo(() => {
        const filteredArticles= articles.filter((a) => a.id !== article?.id);
        const sameCategoryArticles = filteredArticles.filter((a)=>a.category.name === article?.category.name)
        return sameCategoryArticles.slice(0,3)
    }, [articles, article]);


    // const randomOtherArticles = useMemo(() => {
    //     const shuffled = [...otherArticles].sort(() => 0.5 - Math.random());
    //     return shuffled.slice(0, 3);
    // }, [otherArticles]);

    if (loading) return <p className="text-center mt-10">Loading article...</p>;
    if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
    if (!article) return <p className="text-center mt-10">No article data</p>;

  return (
    <div className={`${isDarkMode?'bg-neutral-800 ':'bg-white '}`}>
        <Navbar/>
        <div className={`max-w-5xl mx-auto px-4 py-10 text-gray-900 font-sans leading-relaxed ${isDarkMode?' text-white':' text-neutral-800'}`}>
            
        <p className={`text-center text-sm `}>
            {new Date(article.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            })}{' '}
            · Created by {article.user.username}
        </p>
        <h1 className={`  text-3xl font-bold text-center mb-8`}>{article.title}</h1>

        
            <Image
            src={article.imageUrl || placeholderImage}
            alt={article.title}
            width={1120}
            height={480}
            className="w-full rounded-lg shadow-md mb-10 object-cover"
            style={{ maxHeight: '400px' }}
            />
        

        <article
            className="prose prose-lg max-w-none "
            dangerouslySetInnerHTML={{ __html: article.content }}
        />
        <div className=' px-5 pt-10 flex justify-center content-center flex-col'>
        <h1 className=' bold'>Other Articles</h1>
            
            <div className=" py-5 justify-center content-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
                {otherArticles.length === 0 ? (
                <p>No articles available with same category.</p>
                ) : (
                
                otherArticles.map(article => (
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
                            <div className="h-[176px] py-5 flex flex-col justify-between px-4">
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
                        </CardContent>
                    </Card>
                        
                    ))
                )}
            </div>
        </div>
        </div>
        <Footer/>
    </div>
  );
}
