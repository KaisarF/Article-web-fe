'use client'

import api from "@/app/axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';
import arrow from "@/../public/arrowLeft.svg"
import uploadImg from '@/../public/uploadImg.svg'
import 'react-quill-new/dist/quill.snow.css';
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })
interface Category {
    id: number | string;
    name: string;
}

 export default function AddArticles(){
    const router = useRouter();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        categoryId: ''
    });
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    
    const [errors, setErrors] = useState<{ title?: string; content?: string; categoryId?: string; image?: string }>({});

    useEffect(() => {
        const getCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategoriesList(response.data.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };
        getCategories();
    }, []);

    const validateForm = () => {
        const newErrors: { title?: string; content?: string; categoryId?: string; image?: string } = {};

        if (!formData.title.trim()) newErrors.title = 'Title is required.';
        if (!formData.content.trim()) newErrors.content = 'Content is required.';
        if (!formData.categoryId) newErrors.categoryId = 'Category must be selected.';
        if (!selectedFile) newErrors.image = 'Thumbnail image is required.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);

            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            const url = URL.createObjectURL(file);
            setPreviewUrl(url);

            if(errors.image) setErrors(prev => ({ ...prev, image: undefined }));
        }
    }
    
    const handleDeleteImage = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
    };

    async function handleUpload() {
        if (!validateForm()) {
            return;
        }

        try {
            const imageFormData = new FormData();
            imageFormData.append('image', selectedFile!);
            const uploadResponse = await api.post('/upload', imageFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const imageUrl = uploadResponse.data.imageUrl;

            const articleData = {
                title: formData.title,
                content: formData.content,
                categoryId: formData.categoryId,
                imageUrl,
            };

            await api.post('/articles', articleData);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Article has been created successfully.',
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                router.push('/admin/articles');
            });

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: 'An error occurred while creating the article. Please try again.',
            });
        }
    }
    
    const resetForm = () => {
        handleDeleteImage();
        setFormData({ title: '', content: '', categoryId: '' });
        setErrors({});
    }

    return (
        <div className="w-full mx-auto p-6 bg-white rounded-md shadow-md">
            <div className="flex flex-row items-center gap-2 text-m mb-5">
                <Link href={'/admin/articles'}>
                    <Image src={arrow} alt="arrow" width={30} height={30} />
                </Link>
                <p> Create Article </p>
            </div>
            
            
            <div className="mb-6">
                <label className="block text-m font-medium text-gray-700 mb-1">Thumbnail</label>
                {previewUrl ? (
                    <div className="w-80 p-2 border border-gray-300 rounded-md">
                        <div className="relative w-full h-44">
                            <Image
                                src={previewUrl}
                                alt="Preview"
                                layout="fill"
                                className="object-contain rounded-md"
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-center gap-4 text-sm">
                            <label htmlFor="fileInput" className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                                Changes
                            </label>
                            <button onClick={handleDeleteImage} className="text-red-600 underline hover:text-red-800">
                                Delete
                            </button>
                        </div>
                    </div>
                ) : (
                    
                    <label
                        htmlFor="fileInput"
                        className={`flex flex-col items-center justify-center w-80 h-44 border-2 border-dashed rounded-md cursor-pointer hover:border-gray-400 ${errors.image ? 'border-red-500' : 'border-gray-300'}`}
                    >
                        <Image src={uploadImg} alt="upload img" width={30} height={30} />
                        <span className="text-xs text-gray-500 text-center mt-2">
                            Click to select a file
                            <br />
                            Support File Type: JPG, PNG
                        </span>
                    </label>
                )}
                
                <input
                    id="fileInput"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                />
                {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
            </div>

            
            <div className="mb-4">
                <label htmlFor="title" className="block text-m font-medium text-gray-700 mb-1">Title</label>
                <input
                    id="title" type="text" placeholder="Input title" value={formData.title}
                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            
            <div className="mb-6">
                <label htmlFor="category" className="block text-m font-medium text-gray-700 mb-1">Category</label>
                <select
                    id="category" value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className={`w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                >
                    <option value="" disabled>Select category</option>
                    {categoriesList.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId}</p>}
                <p className="text-xs text-gray-500 mt-1">
                    The existing category list can be seen in the{' '}
                    <Link href={'/admin/categories'} className="underline text-blue-600 hover:text-blue-700">category</Link> menu
                </p>
            </div>

            
            <div className="mb-20 h-30 ">
                <label htmlFor="content" className="block text-m font-medium text-gray-700 mb-1">Content</label>
                <ReactQuill
                    id="content"  
                    placeholder="Type a content..." 
                    value={formData.content}
                    onChange={(value) => setFormData(prev => ({...prev, content:value}))}
                    className={`w-full  h-full rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600 ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
            </div>

            
            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={resetForm}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={handleUpload} 
                >
                    Create Article
                </button>
            </div>
        </div>
    )
 }