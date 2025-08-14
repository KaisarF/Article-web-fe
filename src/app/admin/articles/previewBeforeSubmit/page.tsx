"use client";
import Image from 'next/image';

import api from '@/app/axios';
import { useEffect, useState, useMemo} from 'react';
import React  from 'react';
import Navbar from "@/components/navbar";
import Footer from '@/components/footer';

import { useArticleStore } from '@/app/stores/articleStores';
import { Card, CardContent } from '@/components/ui/card';

import placeholderImage from '@/../public/uploadImg.svg'; 
interface UserData {
  username: string;
  role: string;

}
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
  if (!content) return '';
  const truncated = content.slice(0, counter);
  return truncated.length === content.length ? truncated : `${truncated}...`;
};

export default function Page() {

    const { previewData} = useArticleStore();
    const [userData, SetUserData] = useState <UserData | null>()
    const [articleCat, setArticleCat] = useState<Article[]>([])
    const GetUserData = async()=>{
        const response = await api.get('/auth/profile')
        SetUserData(response.data)

    }
    const getArticleCat = async ()=>{
        try{
            const response = await api.get(`articles?category=${previewData?.categoryId}`)
            setArticleCat(response.data.data)
        }catch(error){
            console.error("Failed to fetch user data:", error)
        }
        
    }


    useEffect(()=>{
        GetUserData()
        getArticleCat()
    },[])

    const topThreeArticle = useMemo(()=>{
        return articleCat.slice(0,3)
    },[articleCat]) 
    

  return (
    <div>
        <Navbar/>
        <div className="max-w-5xl mx-auto px-4 py-10 text-gray-900 font-sans leading-relaxed">
            
        <p className="text-center text-sm text-gray-500 mb-2">
            {new Date(previewData?.createdAt??"").toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            })}{' '}
            · Created by {userData?.username}
        </p>
        <h1 className="text-3xl font-bold text-center mb-8">{previewData?.title}</h1>

        
        {previewData?.imageUrl && (
            <Image
                src={previewData?.imageUrl  || placeholderImage}
                alt={previewData?.title}
                width={1120}
                height={480}
                className="w-full rounded-lg shadow-md mb-10 object-cover"
                style={{ maxHeight: '400px' }}
                priority 
            />
        )}
        
        <article
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: previewData?.content ??""}}
        />
            <div className=' px-5 pt-10 flex justify-center content-center flex-col'>
            <h1 className='font-bold text-2xl'>Other Articles</h1>
            
            <div className=" py-5 justify-center content-center grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 h-full">
                {topThreeArticle.length === 0 ? (
                    <p>No other articles available.</p>
                ) : (
                    topThreeArticle.map(article => (
                        <Card key={article.id} >
                        <CardContent>
                            <div className="bg-white overflow-hidden h-[432px]"  >
                                <Image
                                    src={article.imageUrl || placeholderImage}
                                    alt={article.title}
                                    width={387}
                                    height={240}
                                    className="object-cover w-[387px] h-[240px] text-black rounded-2xl"
                                />
                                <div className="h-[176px] py-5 flex flex-col justify-between">
                                    <div>
                                    <p className="text-sm text-gray-600">
                                        {new Date(article.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        })}
                                    </p>
                                    <h4 className="text-xl font-bold text-[#0F172A]">{wordLimitation(article.title, 20)}</h4>
                                    <div
                                        className="prose text-[#475569]"
                                        dangerouslySetInnerHTML={{ __html: wordLimitation(article.content, 100) }}
                                    />
                                    </div>
                                    <p className="text-sm text-[#1E3A8A] bg-[#BFDBFE] w-fit px-4 py-1 rounded-2xl "> {wordLimitation(article.category?.name || 'Unknown', 10)}</p>
                                </div>
                            </div>
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