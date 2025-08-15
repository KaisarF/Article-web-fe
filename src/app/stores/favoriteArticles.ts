'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type FavoriteItem = {
  id: string | number;
  title: string;
  content: string;
  imageUrl: string;
  createdAt: string;
  category: string

};

type FavoritesState = {
  items: Record<string | number, FavoriteItem>;
  add: (item: FavoriteItem) => void;
  remove: (id: string | number) => void;
  toggle: (item: FavoriteItem) => void;
  isFavorited: (id: string | number) => boolean;
  clear: () => void;
};

const storage =
  typeof window !== 'undefined'
    ? createJSONStorage(() => localStorage)
    : undefined;

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: {},
      add: (item) =>
        set((state) => ({
          items: { ...state.items, [item.id]: item },
        })),
      remove: (id) =>
        set((state) => {
          const copy = { ...state.items };
          delete copy[id];
          return { items: copy };
        }),
      toggle: (item) => {
        const { items } = get();
        if (items[item.id]) {
          get().remove(item.id);
        } else {
          get().add(item);
        }
      },
      isFavorited: (id) => !!get().items[id],
      clear: () => set({ items: {} }),
    }),
    {
      name: 'favorites-v1',
      storage, // <-- sudah aman untuk SSR
      version: 1,
    }
  )
);
