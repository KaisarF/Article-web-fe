'use client'

import { createContext, useState, useEffect } from 'react';

type DarkModeContextType = {
    isDarkMode: boolean;
    setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

const getInitialDark = () => {
  if (typeof window === 'undefined') return false; 
  try {
    const saved = window.localStorage.getItem('isDarkMode');
    return saved ? JSON.parse(saved) : false;
  } catch {
    return false;
  }
};

export function DarkModeProvider({
        children,
    }: {
    children: React.ReactNode
    })  {
    const [isDarkMode, setIsDarkMode] = useState<boolean>(getInitialDark);

    useEffect(() => {
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    }, [isDarkMode]);

    return (
        <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    );
}

export const DarkMode = DarkModeContext;
export default DarkModeProvider;
export {DarkModeContext};