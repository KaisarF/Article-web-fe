import { Suspense } from 'react';
import ArticlesClientComponent from './ArticlesClientComponent';

// Ini adalah Server Component (default)
export default function ArticlesPage() {
  return (
    // Bungkus komponen klien dengan Suspense
    // Fallback akan ditampilkan saat build dan saat komponen klien sedang loading
    <Suspense fallback={<div className="p-10 text-center">Loading articles...</div>}>
      <ArticlesClientComponent />
    </Suspense>
  );
}