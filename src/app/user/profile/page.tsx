'use client'

import api from "@/app/axios";
import { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Cookies from 'js-cookie';
import { useDarkMode } from "@/app/hooks/darkMode";
interface UserData {
  username: string;
  role: string;
}

export default function Profile() {

  
  const [userData, setUserData] = useState<UserData | null>(null);
  const {isDarkMode} = useDarkMode()
  useEffect(() => {

    const getUserData = async () => {
      try {
        const response = await api.get('/auth/profile');
        setUserData(response.data); 
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        
      }
    };
    getUserData();
    

  }, []); 

  const userPassword = Cookies.get('password');
  if (!userData) {
    return (
      <div className="flex flex-col min-h-screen w-full">
        <Navbar/>
        <div className="flex-grow flex items-center justify-center">
          <p>Loading profile...</p>
        </div>
        <Footer/>
      </div>
    );
  }

  const initial = userData.username.charAt(0).toUpperCase();

  return (
    <div className={`${isDarkMode?'bg-neutral-800 ':'bg-white '} flex flex-col min-h-screen w-full`}>
      <Navbar/>
      <div className={`${isDarkMode?'text-white':'text-neutral-800 '} flex-grow flex flex-col items-center justify-center  p-4 min-h-full`}>
        <h1 className="text-xl font-semibold mb-6">User Profile</h1>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-300 flex items-center justify-center text-white text-2xl font-bold">
            {initial}
          </div>
        </div>

        <div className=" w-[350px] sm:w-full max-w-sm bg-white shadow-md rounded-md">
          <table className="w-full table-fixed border-collapse text-sm sm:text-base p-3">
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium text-gray-700 text-left w-32">Username</td>
                <td className="px-3 text-gray-900">:</td>
                <td className="p-3 text-gray-900">{userData.username}</td>
              </tr>
              <tr className="border-b">
                <td className="p-3 font-medium text-gray-700 text-left">Password</td>
                <td className="px-3 text-gray-900">:</td>
                <td className="p-3 text-gray-900">{userPassword}</td> 

              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-700 text-left">Role</td>
                <td className="px-3 text-gray-900">:</td>
                <td className="p-3 text-gray-900">{userData.role}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <Footer/>
    </div>
  );
}