'use client'

import api from "@/app/axios";
import { useState, useEffect } from "react";
import Link from 'next/link';
import Cookies from 'js-cookie';
interface UserData {
  username: string;
  role: string;
  // Tambahkan properti lain yang mungkin ada, misalnya:
  // id: number;
  // email: string;
}
export default function Profile() {

  const [userData, SetUserData] = useState <UserData | null>()

  const GetUserData = async()=>{
    const response = await api.get('/auth/profile')
    SetUserData(response.data)

  }

  useEffect(()=>{
    GetUserData()
  },[])
  const initial = userData?.username?.charAt(0).toUpperCase() || '';
  const userPassword = Cookies.get('password')
  return (
    <div className="flex flex-col min-h-screen w-full">
      
        <div className="flex-grow flex flex-col items-center justify-center bg-white p-4 min-h-full">
        <h1 className="text-xl font-semibold mb-6">User Profile</h1>

        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-blue-300 flex items-center justify-center text-white text-2xl font-bold">
            {initial}
          </div>
        </div>

        <div className=" h-full max-w-sm bg-white shadow-md rounded-md">
          <table className="w-full table-fixed border-collapse">
            <tbody>
              <tr className="border-b">
                <td className="p-3 font-medium text-gray-700 text-left w-32">Username</td>
                <td className="p-3 text-gray-900">:</td>
                <td className="p-3 text-gray-900">{userData?.username}</td>
              </tr>
              <tr className="border-b my-4 py-5">
                <td className="p-3 font-medium text-gray-700 text-left">Password</td>
                <td className="p-3 text-gray-900">:</td>
                <td className="p-3 text-gray-900">{userPassword}</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-gray-700 text-left">Role</td>
                <td className="p-3 text-gray-900">:</td>
                <td className="p-3 text-gray-900">{userData?.role}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <Link className="m-10 rounded-md w-50 p-3 text-center bg-[#2563EB] text-white" href={'/admin/articles'} >Back To Dashboard</Link>
      </div>

      </div>
    );
}