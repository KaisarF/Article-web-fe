// src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

// Tipe T bisa berupa string, number, dll.
export function useDebounce<T>(value: T, delay: number): T {
  // State untuk menyimpan nilai yang sudah di-debounce
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(
    () => {
      // Atur timeout untuk memperbarui nilai debounced setelah delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Fungsi cleanup: batalkan timeout jika `value` atau `delay` berubah
      // sebelum timeout selesai. Ini adalah inti dari debouncing.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Hanya jalankan ulang efek ini jika value atau delay berubah
  );

  return debouncedValue;
}