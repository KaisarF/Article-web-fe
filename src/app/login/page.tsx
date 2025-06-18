"use client";

import { useActionState, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';

// Impor UI
import logoipsum from '../../../public/logoIpsum.svg';
import eyeOff from '../../../public/eye-off.svg';

import { loginAction } from "./action";

const initialState = {
  errors: undefined,
  message: undefined,
};

export default function Login() {

  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction}>
      <div className='flex justify-center items-center w-screen h-screen m-0 p-0 bg-[#F3F4F6]'>
        <div className='flex flex-col justify-center items-center w-[400px] h-auto min-h-[452px] bg-white p-6 rounded-md shadow-md'>
          <Image
            src={logoipsum}
            alt='logoipsum'
          />
          <div className='flex flex-col justify-center w-[368px] gap-2 mt-10 mb-10 relative'>
            <label htmlFor="username" className='text-[#111827]'>Username</label>
            <input
              type="text" 
              id="username"
              name="username" 
              placeholder='Input username'
              className='px-3 py-1 border-2 border-[#E2E8F0] text-[#64748B] rounded-md'
            />
            {/* Tampilkan error validasi dari state */}
            {state.errors?.username && (
              <p className="text-red-500 text-sm mt-1">{state.errors.username[0]}</p>
            )}

            <label htmlFor="password" className='text-[#111827] mt-4'>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password" // 'name' attribute wajib untuk FormData
                placeholder='Input password'
                className='px-3 py-1 border-2 border-[#E2E8F0] text-[#64748B] rounded-md w-full pr-10'
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
              >
                <Image src={eyeOff} alt="Toggle password visibility" />
              </button>
            </div>
            {state.errors?.password && (
              <p className="text-red-500 text-sm mt-1">{state.errors.password[0]}</p>
            )}
            {state.message && (
              <p className="text-red-500 text-sm mt-2 text-center">{state.message}</p>
            )}

            <button
              type='submit'
              disabled={isPending} // Gunakan isPending dari useActionState
              className='w-full bg-[#2563EB] h-10 rounded-md mt-5 text-white font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed'
            >
              {isPending ? "Logging in..." : "Login"}
            </button>
          </div>
          <p className='text-[#475569]'>
            Don’t have an account? 
            <Link className='text-[#2563EB] underline' href='/register'>Register</Link>
          </p>
        </div>
      </div>
    </form>
  );
}