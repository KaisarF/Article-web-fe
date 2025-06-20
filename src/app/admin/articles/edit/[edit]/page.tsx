'use client'

import api from "@/app/axios";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import arrow from "@/../public/arrowLeft.svg";
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// <<< PERBAIKAN 1: Definisikan interface untuk data Anda
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

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        categoryId: ''
    });
    
    // <<< PERBAIKAN 2: Terapkan interface pada state
    const [categoriesList, setCategoriesList] = useState<Category[]>([]);
    const [currentData, setCurrentData] = useState<ArticleData | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [errors, setErrors] = useState<{ title?: string; content?: string; categoryId?: string }>({});

    const unwrappedParams = use(params);
    const currentArticleId = unwrappedParams.edit;

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true); // Pastikan loading state aktif
            try {
                const [articleRes, categoriesRes] = await Promise.all([
                    api.get(`/articles/${currentArticleId}`),
                    api.get('/categories')
                ]);
                
                const articleData: ArticleData = articleRes.data; // TypeScript sekarang tahu bentuk datanya
                setCurrentData(articleData);
                setCategoriesList(categoriesRes.data.data);
                
                if (articleData) {
                    setFormData({
                        title: articleData.title,
                        content: articleData.content,
                        categoryId: String(articleData.categoryId), // Pastikan categoryId adalah string untuk select
                    });
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Load Failed',
                    text: 'Could not load article data. Please try again later.',
                });
            } finally {
                setIsLoading(false);
            }
        };
        if (currentArticleId) {
            fetchData();
        }
    }, [currentArticleId]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setSelectedFile(file);
            
            // Hapus URL objek lama jika ada untuk mencegah memory leak
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }

            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    }

    const validateForm = () => {
        const newErrors: { title?: string; content?: string; categoryId?: string } = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required.';
        }
        if (!formData.content.trim()) {
            newErrors.content = 'Content is required.';
        }
        if (!formData.categoryId) {
            newErrors.categoryId = 'Category must be selected.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    async function handleUpdate() {
        if (!validateForm()) {
            return;
        }

        // <<< PERBAIKAN 3: Gunakan non-null assertion (!) karena kita tahu currentData tidak null di sini
        if (!currentData) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Article data is missing.' });
            return;
        }

        try {
            let imageUrl = currentData.imageUrl; 
            
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('image', selectedFile);
                const response = await api.post('/upload', uploadFormData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                imageUrl = response.data.imageUrl;
            }

            const articleDataToUpdate = {
                title: formData.title,
                content: formData.content,
                categoryId: formData.categoryId,
                imageUrl,
            };
            
            await api.put(`/articles/${currentArticleId}`, articleDataToUpdate);
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Article has been updated successfully.',
                timer: 2000,
                showConfirmButton: false,
            }).then(() => {
                router.push('/admin/articles');
            });

        } catch (error) {
            console.error("Update failed:", error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: `An unexpected error occurred. Please try again: ${error}`,
            });
        }
    }

    if (isLoading) {
        return <div className="w-full text-center p-10">Loading article data...</div>;
    }

    if (!currentData) {
        return <div className="w-full text-center p-10">Article not found or failed to load.</div>;
    }

    return (
        <div className="w-full mx-auto p-6 bg-white rounded-md shadow-md">
            <div className="flex flex-row items-center gap-2 text-m mb-5">
                <Link href={'/admin/articles'}>
                    <Image src={arrow} alt="arrow" width={30} height={30} />
                </Link>
                <p> Edit Article </p>
            </div>
            
            <div className="mb-6">
                <label className="block text-m font-medium text-gray-700 mb-1">Thumbnail</label>
                <label
                    htmlFor="fileInput"
                    className="flex flex-col items-center justify-center w-80 h-44 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400"
                >
                    {previewUrl ? (
                        <Image src={previewUrl} width={100} height={100} alt="New Preview" className="object-contain p-2" />
                    ) : currentData.imageUrl ? (
                        <Image src={currentData.imageUrl} width={100} height={100} alt="Current Thumbnail" className="object-contain p-2" />
                    ) : (
                        <span className="text-xs text-gray-500 text-center">Click to select a file</span>
                    )}
                    <input
                        id="fileInput" type="file" accept=".jpg,.jpeg,.png"
                        onChange={handleFileChange} className="hidden"
                    />
                </label>
                {selectedFile && (
                    <p className="mt-2 text-m text-gray-600">New file: {selectedFile.name}</p>
                )}
            </div>

            <div className="mb-4">
                <label htmlFor="title" className="block text-m font-medium text-gray-700 mb-1">Title</label>
                <input
                    id="title" type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="mb-6">
                <label htmlFor="category" className="block text-m font-medium text-gray-700 mb-1">Category</label>
                <select
                    id="category"
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className={`w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}`}
                >
                    <option value="" disabled>Select Category</option>
                    {/* TypeScript sekarang tahu 'cat' adalah tipe 'Category' */}
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

            <div className="mb-6">
                <label htmlFor="content" className="block text-m font-medium text-gray-700 mb-1">Content</label>
                <textarea
                    id="content" rows={10}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className={`w-full border rounded-md px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-blue-600 ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
                />
                {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content}</p>}
            </div>

            <div className="flex justify-end space-x-3">
                <Link href="/admin/articles" passHref>
                    <button type="button" className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100">
                        Cancel
                    </button>
                </Link>
                <button
                    type="button"
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    onClick={handleUpdate}
                >
                    Save Changes
                </button>
            </div>
        </div>
    )
}