import {create} from 'zustand';

interface ArticleStore {
  previewData: {
    title: string;
    content: string;
    categoryId: string;
    imageUrl: string;
    createdAt:string
  } | null;
  setPreviewData: (data: {
    title: string;
    content: string;
    categoryId: string;
    imageUrl: string;
    createdAt:string
  }) => void;
  resetPreviewData: () => void;
}

export const useArticleStore = create<ArticleStore>((set) => ({
  previewData: null,
  setPreviewData: (data) => set({ previewData: data }),
  resetPreviewData: () => set({ previewData: null }),
}));
