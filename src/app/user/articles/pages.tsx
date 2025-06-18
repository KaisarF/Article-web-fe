import api from '@/app/axios';
import ArticlesClient from './ArticlesClient';

// Fungsi helper Anda (getArticles, getCategories) tidak perlu diubah.
// ...
async function getArticles(searchParams: URLSearchParams) {
  try {
    const response = await api.get(`/articles?${searchParams.toString()}`);
    return {
      articles: response.data.data || [],
      total: response.data.total || 0,
    };
  } catch (error) {
    console.error("Server-side fetch for articles failed:", error);
    return { articles: [], total: 0 };
  }
}

async function getCategories() {
  try {
    const response = await api.get('/categories');
    return response.data.data || [];
  } catch (error) {
    console.error("Server-side fetch for categories failed:", error);
    return [];
  }
}
// --- UBAH HANYA BAGIAN INI ---
// Hapus `params` dari destructuring dan dari definisi tipe
export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
// --- SAMPAI SINI ---

  // Siapkan parameter untuk fetch data awal
  // Tidak perlu ganti nama variabel lagi, karena tidak ada konflik
  const params = new URLSearchParams(); 
  params.set('page', String(searchParams.page || 1));
  params.set('limit', String(searchParams.pageSize || 5));
  if (searchParams.search) params.set('search', String(searchParams.search));
  if (searchParams.category) params.set('category', String(searchParams.category));

  // Ambil data awal di server secara paralel
  const [articlesData, categoriesData] = await Promise.all([
    getArticles(params), // Gunakan variabel baru
    getCategories()
  ]);

  // Kirim data yang sudah di-fetch sebagai props ke komponen klien
  return (
    <ArticlesClient 
      initialArticles={articlesData.articles}
      initialTotal={articlesData.total}
      categories={categoriesData}
    />
  );
}