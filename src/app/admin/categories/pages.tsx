import { Suspense } from 'react';
import CategoriesClientComponent from './CategoriesClientComponent';

// Ini adalah Server Component (default)
export default function CategoriesPage() {
  return (
    // Bungkus komponen klien dengan Suspense
    // Fallback akan ditampilkan saat prerendering di server
    // dan saat komponen klien sedang loading di browser.
    <Suspense fallback={<div className="p-10">Loading categories...</div>}>
      <CategoriesClientComponent />
    </Suspense>
  );
}