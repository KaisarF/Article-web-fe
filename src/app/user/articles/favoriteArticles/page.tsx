'use client';
import { useFavorites } from "@/app/stores/favoriteArticles";
import { useDarkMode } from "@/app/hooks/darkMode";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { HeartOff } from "lucide-react";
export default function FavoritesPage() {
  const favoriteArticles = Object.values(useFavorites((s) => s.items));
  const remove = useFavorites((s) => s.remove);

  const { isDarkMode } = useDarkMode()
const wordLimitation = (content: string, counter: number) => {
  if (!content) return '';
  const truncated = content.slice(0, counter);
  return truncated.length === content.length ? truncated : `${truncated}...`;
};
  return (
    <>
    <div className={`w-full h-screen overflow-y-scroll ${isDarkMode?'bg-neutral-800 ':'bg-white '}`}>
      <Navbar/>
      <div className={`flex flex-col items-center justify-center gap-10 ${isDarkMode?'text-white ':'text-neutral-800 '} `}>
        <h1 className="text-xl font-bold mb-4">My Favorites</h1>
          {favoriteArticles.length === 0 ? (
            <p>Belum ada favorit.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-10 gap-8 h-full">
              {favoriteArticles.map((article) => (
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
                          {wordLimitation(article.category || 'Unknown', 10) || 'Unknown'}
                        </p>
                        
                      </div>
                    </Link>
                        <Button variant={'destructive'} onClick={() => remove(article.id)} className="w-fit">
                          <HeartOff/> un-favorite
                        </Button>
                  </CardContent>
                </Card>
                
              ))}
            </div>
          )}
      </div>
    </div>
    </>
  );
}
