'use client'

import api from "@/app/axios";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import arrow from "@/../public/arrowLeft.svg";
import uploadImg from '@/../public/uploadImg.svg';
import 'react-quill-new/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { useArticleStore } from "@/app/stores/articleStores";

import { Button } from "@/components/ui/button";

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface Category {
  id: number | string;
  name: string;
}

interface ArticleData {
  id: number | string;
  title: string;
  content: string;
  categoryId: number | string;
  imageUrl: string;
}

export default function EditArticles({ params }: { params: Promise<{ edit: string }> }){
  const router = useRouter();
  const unwrapped = use(params);
  const articleId = unwrapped.edit;

  const [categories, setCategories] = useState<Category[]>([]);
  const [current, setCurrent] = useState<ArticleData|null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setPreviewData } = useArticleStore();

  const [selectedFile, setSelectedFile] = useState<File|null>(null);
  const [previewUrl, setPreviewUrl] = useState<string|null>(null);
  const [removedImage, setRemovedImage] = useState(false);

  const [formData, setFormData] = useState({ title: '', content: '', categoryId: '' });
  const [errors, setErrors] = useState<{ title?: string; content?: string; categoryId?: string; image?: string }>({});

  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true);
      try {
        const [artRes, catRes] = await Promise.all([
          api.get(`/articles/${articleId}`),
          api.get('/categories')
        ]);
        const art: ArticleData = artRes.data;
        setCurrent(art);
        setCategories(catRes.data.data);
        setFormData({
          title: art.title,
          content: art.content,
          categoryId: String(art.categoryId)
        });
      } catch (e) {
        console.error(e);
        Swal.fire({ icon:'error', title:'Load Failed', text:'Could not load data.' });
      } finally { setIsLoading(false); }
    }
    if (articleId) fetchAll();
  }, [articleId]);

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.title.trim()) errs.title = 'Title is required.';
    if (!formData.content.trim()) errs.content = 'Content is required.';
    if (!formData.categoryId) errs.categoryId = 'Category must be selected.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) {
      const file = e.target.files[0];
      setSelectedFile(file);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
      setRemovedImage(false);
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  }
  
  const handleDeleteImage = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setSelectedFile(null);
    setRemovedImage(true);
  };

  const handlePreview = () => {
    if (!validate()) {
        return;
        }
        const currentTime = new Date();
        const formattedTime = currentTime.toLocaleString();
        const previewData = {
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        imageUrl: previewUrl || '',
        createdAt:formattedTime
        };

        setPreviewData(previewData);
        router.push('/admin/articles/previewBeforeSubmit');
    };

  async function handleUpdate() {
    if (!validate()) return;
    if (!current) {
      Swal.fire({ icon:'error', title:'Error', text:'No article data.'});
      return;
    }

    try {
      let imageUrl = current.imageUrl;
      if (removedImage) {
        imageUrl = '';
      }
      if (selectedFile) {
        const fd = new FormData(); fd.append('image', selectedFile);
        const up = await api.post('/upload', fd, { headers: {'Content-Type':'multipart/form-data'} });
        imageUrl = up.data.imageUrl;
      }

      await api.put(`/articles/${articleId}`, {
        title: formData.title,
        content: formData.content,
        categoryId: formData.categoryId,
        imageUrl
      });

      Swal.fire({ icon:'success', title:'Updated!', text:'Article updated.', timer:2000, showConfirmButton:false })
        .then(() => router.push('/admin/articles'));

    } catch (e) {
      console.error(e);
      Swal.fire({ icon:'error', title:'Update Failed', text:String(e) });
    }
  }

  const resetForm = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemovedImage(false);
    if (current) setFormData({ title: current.title, content: current.content, categoryId: String(current.categoryId) });
    setErrors({});
  };

  if (isLoading) return <div className="w-full text-center p-10">Loading...</div>;
  if (!current) return <div className="w-full text-center p-10">Article not found.</div>;

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-md shadow-md">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/admin/articles"><Image src={arrow} alt="back" width={30} height={30}/></Link>
        <p>Edit Article</p>
      </div>

      {/* Thumbnail */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Thumbnail</label>
        {previewUrl || (current.imageUrl && !removedImage) ? (
          <div className="w-80 p-2 border rounded-md">
            <div className="relative w-full h-44">
              <Image src={previewUrl||current.imageUrl} alt="Preview" fill className="object-contain rounded-md"/>
            </div>
            <div className="mt-2 flex justify-center gap-4 text-sm">
              <label htmlFor="fileInput" className="underline cursor-pointer">Change</label>
              <button onClick={handleDeleteImage} className="underline text-red-600">Delete</button>
            </div>
          </div>
        ) : (
          <label htmlFor="fileInput" className={`flex flex-col items-center justify-center w-80 h-44 border-2 rounded-md cursor-pointer ${errors.image? 'border-red-500':'border-gray-300'}`}>
            <Image src={uploadImg} alt="upload" width={30} height={30}/>
            <span className="text-xs mt-2 text-gray-500 text-center">Click to select a file<br/>JPG, PNG</span>
          </label>
        )}
        <input id="fileInput" type="file" accept=".jpg,.jpeg,.png" onChange={handleFileChange} className="hidden" />
        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block mb-1 font-medium">Title</label>
        <input id="title" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})}
          className={`w-full border rounded px-3 py-2 ${errors.title?'border-red-500':'border-gray-300'}`} />
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
      </div>

      {/* Category */}
      <div className="mb-6">
        <label htmlFor="cat" className="block mb-1 font-medium">Category</label>
        <select id="cat" value={formData.categoryId} onChange={e=>setFormData({...formData,categoryId:e.target.value})}
          className={`w-full border rounded px-3 py-2 ${errors.categoryId?'border-red-500':'border-gray-300'}`}>
          <option value="" disabled>Select category</option>
          {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
      </div>

      {/* Content */}
      <div className="mb-6">
        <label htmlFor="content" className="block mb-1 font-medium">Content</label>
        <ReactQuill value={formData.content} onChange={v=>setFormData({...formData,content:v})} className={`${errors.content?'border-red-500':'border-gray-300'} rounded`} />
        {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
      </div>

      <div className="flex justify-end space-x-3">
       <Button
                    type="button"
                    variant={"outline"}
                    onClick={resetForm}
                >
                    Cancel
                </Button>
                <Button
                    variant={"secondary"}
                    onClick={handlePreview}>
                    preview
                </Button>
                <Button
                    type="button"
                    className=" bg-blue-600"
                    onClick={handleUpdate} 
                >
                    Create Article
                </Button>
      </div>
    </div>
  );
}
