'use client'

import { useEffect, useState, Suspense, useRef } from 'react';
import { useSearchParams,  } from 'next/navigation';

// import Sidebar from '@/components/sidebar';
// import NavbarAdmin from '@/components/navbarAdmin';
import api from '@/app/axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogFooter, DialogClose, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PaginationWithLinks } from "@/components/ui/pagination-with-links";

import { PlusIcon } from '@radix-ui/react-icons';


interface Category {
  id: string;
  name: string;
  createdAt:string;
}

// export default function Categories() {
//   return (
//     <Suspense fallback={<div>Loading...</div>}>
//       <CategoriesContent />
//     </Suspense>
//   );
// }
export default function CategoriesContent() {

  const searchParams = useSearchParams();
  
  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 10;
  // const [userData, setUserData] = useState<UserData | null>(null);
  
  const [totalCategories, setTotalCategories] = useState(0);
  const [listCategories, setListCategories] = useState<Category[]>([]);

  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState(searchValue);
  const debounceRef = useRef<number | null>(null);


  const handleSearchDebounced = (query:string) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = window.setTimeout(() => {
            getCategoryData(page, pageSize, query);
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

  const getCategoryData = async (
    currentPage: number, 
    limit: number, 
    search = '', 

  ) => {
    try {
      const queryParams = {
          search:search,
          page: currentPage,
          limit: limit,
        };

      const response = await api.get(`/categories`,{params:queryParams});
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
    getCategoryData(page, pageSize, debouncedSearchValue,);
  }, [page, pageSize, debouncedSearchValue ]);

  

  const emptyData = () => {
    setCategoryName('');
  };

  const openEditModal = (category: Category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    // setShowEditModal(true);
  };

  const openDeleteModal = (category: Category) => {
    setCurrentCategory(category);
    // setShowDeleteModal(true);
  };

  const handleAddCategory = async () => {
    try {
      await api.post('/categories', { name: categoryName });
      
      getCategoryData(page, pageSize, debouncedSearchValue);
    } catch (error) {
      console.error("Add category failed", error);
    }
  };

  const handleEditCategory = async () => {
    if (!currentCategory) return;
    try {
      await api.put(`/categories/${currentCategory.id}`, { name: categoryName });
      
      getCategoryData(page, pageSize, debouncedSearchValue);
    } catch (error) {
      console.error("Edit category failed", error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!currentCategory) return;
    try {
      await api.delete(`/categories/${currentCategory.id}`);
      
      getCategoryData(page, pageSize, debouncedSearchValue);
    } catch (error) {
      console.error("Delete category failed", error);
    }
  };

// const initial = userData?.username.charAt(0).toUpperCase() || '';
  return (
    <Suspense fallback={<div>Loading...</div>}>
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
                    value={searchValue}
                  onChange={e => {
                    setSearchValue(e.target.value);
                    handleSearchDebounced(e.target.value);
                  }} 
                  />
                </div>
                <Dialog>
                  <DialogTrigger>
                    <Button onClick={emptyData} className='bg-[#2563EB]'>
                      <PlusIcon/> Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='w-90'>
                    <DialogHeader>
                      <DialogTitle>
                        Add Category
                      </DialogTitle>
                    </DialogHeader>
                    <div>
                      {/* <h2 className='text-[#0F172A] text-[20px] font-bold'>Add Category</h2> */}
                        <div className='flex flex-col gap-2'>
                          <Label htmlFor="text" className='font-semibold'>Category</Label>
                          <Input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            placeholder="Category name"
                            className='w-full px-4 py-3 border-1 rounded-xl'
                            required
                          />  
                        </div>

                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant={'outline'}>cancel</Button>
                      </DialogClose>
                      <Button onClick={()=>handleAddCategory()} className='bg-[#2563EB]' >add</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
            </div>
            {/* Add Modal */}
      
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
                          
                          <Dialog>
                            <DialogTrigger>
                              <Button variant={"ghost"} onClick={()=>openEditModal(category)} className='text-[#2563EB] underline'>
                                edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='w-90'>
                              <DialogHeader>
                                <DialogTitle>
                                  Edit Category
                                </DialogTitle>
                              </DialogHeader>
                              <div>
                                {/* <h2 className='text-[#0F172A] text-[20px] font-bold'>Add Category</h2> */}
                                  <div className='flex flex-col gap-2'>
                                    <Label htmlFor="text" className='font-semibold'>Category</Label>
                                    <Input
                                      type="text"
                                      value={categoryName}
                                      onChange={(e) => setCategoryName(e.target.value)}
                                      placeholder="Category name"
                                      className='w-full px-4 py-3 border-1 rounded-xl'
                                      required
                                    />  
                                  </div>

                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant={'outline'}>cancel</Button>
                                </DialogClose>
                                <DialogClose asChild >

                                <Button onClick={handleEditCategory} className='bg-[#2563EB]' >edit</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          {/* delete */}
                          <Dialog>
                            <DialogTrigger>
                              <Button variant={"ghost"} onClick={()=>openDeleteModal(category)} className='text-[#EF4444] underline'>
                                delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent className='w-90'>
                              <DialogHeader>
                                <DialogTitle>
                                  Delete Category
                                </DialogTitle>
                              </DialogHeader>
                              <div>
                                <p className='text-[#64748B]' >Delete category “{category.name}”? This will remove it from master data permanently.</p>

                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant={'outline'}>cancel</Button>
                                </DialogClose>
                                <DialogClose asChild >

                                <Button onClick={handleDeleteCategory} variant={"destructive"} >delete</Button>
                                </DialogClose>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          
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
    </Suspense>
  );
}
