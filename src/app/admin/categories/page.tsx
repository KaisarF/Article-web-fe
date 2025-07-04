'use client'

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

// import Sidebar from '@/components/sidebar';
// import NavbarAdmin from '@/components/navbarAdmin';
import api from '@/app/axios';

import { PaginationWithLinks } from "@/components/ui/pagination-with-links";

interface Category {
  id: string;
  name: string;
  createdAt:string;
}

export default function Categories() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoriesContent />
    </Suspense>
  );
}
function CategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  // const [userData, setUserData] = useState<UserData | null>(null);
  
  const [totalCategories, setTotalCategories] = useState(0);
  const [listCategories, setListCategories] = useState<Category[]>([]);

  const [searchQuery, setSearchQuery] = useState<string>('');
  

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const getCategoryData = async (
    currentPage: number, 
    limit: number, 
    search = '', 
    category = ''
  ) => {
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', limit.toString());
      
      if (search) params.append('search', search);
      if (category) params.append('category', category);

      const response = await api.get(`/categories?${params.toString()}`);
      setListCategories(response.data.data)
      setTotalCategories(response.data.totalData);
      console.log(response.data)
    } catch (error) {
      console.error("Failed to fetch articles:", error);
      setListCategories([])
      setTotalCategories(0);
    }
  };

  useEffect(() => {
    getCategoryData(page, pageSize, searchQuery,);
  }, [page, pageSize, searchQuery, ]);

  useEffect(() => {
    const urlSearch = searchParams.get('search') || '';
    
    setSearchQuery(urlSearch);
    
  }, [searchParams]);


  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', pageSize.toString());
    if (value) params.set('search', value);
    router.replace(`?${params.toString()}`);
  };

  const openAddModal = () => {
    setCategoryName('');
    setShowAddModal(true);
  };

  const openEditModal = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setCurrentCategory(category);
    setShowDeleteModal(true);
  };

  const handleAddCategory = async () => {
    try {
      await api.post('/categories', { name: categoryName });
      setShowAddModal(false);
      getCategoryData(page, pageSize, searchQuery);
    } catch (error) {
      console.error("Add category failed", error);
    }
  };

  const handleEditCategory = async () => {
    if (!currentCategory) return;
    try {
      await api.put(`/categories/${currentCategory.id}`, { name: categoryName });
      setShowEditModal(false);
      getCategoryData(page, pageSize, searchQuery);
    } catch (error) {
      console.error("Edit category failed", error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    try {
      await api.delete(`/categories/${currentCategory.id}`);
      setShowDeleteModal(false);
      getCategoryData(page, pageSize, searchQuery);
    } catch (error) {
      console.error("Delete category failed", error);
    }
  };

// const initial = userData?.username.charAt(0).toUpperCase() || '';
  return (
    <>
    <div className=" bg-white py-10">
            <p className="pb-5 px-5 text-gray-700">
              Total Articles:  {totalCategories}
            </p>
            <div className='flex justify-between flex-row items-center p-6 border-2 border-[#E2E8F0]'>
              <div className="flex justify-center space-x-4 w-100">
                  

                  <input
                    type="text"
                    className="flex-grow p-2 rounded-md border w-20 border-gray-300 text-gray-700 bg-white"
                    placeholder="Search articles"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <button onClick={openAddModal} className='px-4 py-2 bg-blue-600 text-white rounded-md'>+ Add Category</button>
            </div>
            {/* Add Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="w-90 h-70 bg-white rounded-md p-10 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className='text-[#0F172A] text-[20px] font-bold'>Add Category</h2>
            <div className='flex flex-col gap-2'>
              <label htmlFor="text" className='font-semibold'>Category</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                className='w-full px-4 py-3 border-1 rounded-xl'
              />  
            </div>
            <div className='flex flex-row items-center gap-2 justify-end'>
              <button onClick={() => setShowAddModal(false)} className='py-2 px-4 border-1 rounded-xl'>Cancel</button>
              <button onClick={handleAddCategory} className='py-2 px-4 border-1 rounded-xl bg-[#2563EB] text-white'>Add</button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && currentCategory && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
          onClick={() => setShowEditModal(false)} 
        >
          <div
            className="w-90 h-70 bg-white rounded-md p-10 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className='text-[#0F172A] text-[20px] font-bold'>Edit Category</h2>
            <div className='flex flex-col gap-2'>
              <label htmlFor="text" className='font-semibold'>Category</label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Category name"
                className='w-full px-4 py-3 border-1 rounded-xl'
              />  
            </div>
            <div className='flex flex-row items-center gap-2 justify-end'>
              <button onClick={() => setShowEditModal(false)} className='py-2 px-4 border-1 rounded-xl'>Cancel</button>
              <button onClick={handleEditCategory} className='py-2 px-4 border-1 rounded-xl bg-[#2563EB] text-white'>Save Changes</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && currentCategory && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-center bg-black/50"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-90 h-70 bg-white rounded-md p-10 flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()} 
          >
            <h2 className='text-[#0F172A] text-[20px] font-bold'>Delete Category</h2>
            <div className='flex flex-col gap-2'>
              
            <p>Are you sure you want to delete <strong>{currentCategory.name}</strong>?</p>
            </div>
            <div className='flex flex-row items-center gap-2 justify-end'>
              <button onClick={() => setShowDeleteModal(false)} className='py-2 px-4 border-1 rounded-xl'>Cancel</button>
              <button onClick={handleDeleteCategory} className='py-2 px-4 border-1 rounded-xl bg-[#DC2626] text-white'>Delete</button>
            </div>
          </div>
        </div>
      )}
    
            <table className="min-w-full border-collapse border border-gray-200 my-5 text-center">
              <thead>
                <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                  <th className="border-y border-gray-300 px-4 py-2 ">Category</th>
                  <th className="border-y border-gray-300 px-4 py-2 ">Created At</th>
                  <th className="border-y border-gray-300 px-4 py-2 ">Action</th>
                </tr>
              </thead>
              <tbody>
                {listCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">No Categories available.</td>
                  </tr>
                ) : (
                  listCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 border-b border-gray-200">

                      <td className="border-y border-gray-300 px-4 py-10">{category.name}</td>
                      <td className="border-y border-gray-300 px-4 py-2 whitespace-nowrap">
                        {new Date(category.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="border-y border-gray-300 px-4 py-2">
                        <div className="flex gap-4 text-sm items-center justify-center">
                          
                          <button className='text-[#2563EB] underline' onClick={() => openEditModal(category)}>Edit</button>
                          <button className='text-[#EF4444] underline' onClick={() => openDeleteModal(category)}>Delete</button>
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
              totalCount={totalCategories} 
              // pageSizeSelectOptions={{
              //   pageSizeOptions: [5, 10, 25, 50],
              // }}
              />
          </div>
    </>
  );
}
