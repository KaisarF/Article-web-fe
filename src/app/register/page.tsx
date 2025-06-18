"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import Link from 'next/link';
import Swal from 'sweetalert2';

import logoipsum from '../../../public/logoIpsum.svg';
import eyeOff from '../../../public/eye-off.svg';

// Impor server action kita
import { registerAction } from "./action";

// Definisikan state awal untuk useActionState
const initialState = {
  errors: undefined,
  message: undefined,
  success: false,
};

export default function Register() {
  const router = useRouter();
  
  // Gunakan useActionState untuk mengelola state form dari server
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  const [showPassword, setShowPassword] = useState(false);

  // Gunakan useEffect untuk menampilkan pesan (misal dari SweetAlert) saat state berubah
  useEffect(() => {
    if (state.success === true) {

      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'You will be redirected to the login page.',
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        router.push('/login');
      });
    } else if (state.message && state.success === false) {
      // Menampilkan error umum dari server
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: state.message,
      });
    }
  }, [state, router]);

  return (
    // Hubungkan form dengan server action menggunakan prop 'action'
    <form action={formAction}> 
      <div className='flex justify-center items-center w-screen h-screen m-0 p-0 bg-[#F3F4F6]'>
        <div className=' flex flex-col justify-center items-center w-[400px] h-auto min-h-[600px] bg-white p-6 rounded-md shadow-md'>
          <Image
            src={logoipsum}
            alt='logoipsum'
          />
          <div className='flex flex-col justify-center w-[368px] gap-2 mt-5 mb-7 relative'>
            
            {/* username input */}
            <label htmlFor="username" className='text-[#111827]'>Username</label>
            <input
              type="text" 
              id="username"
              name="username" // 'name' sangat penting untuk FormData
              placeholder='Input username'
              className='px-3 py-1 border-2 border-[#E2E8F0] text-[#64748B] rounded-md'
            />
            {/* Tampilkan error dari state */}
            {state.errors?.username && (
              <p className="text-red-500 text-sm ">{state.errors.username[0]}</p>
            )}

            {/* password input */}
            <label htmlFor="password" className='text-[#111827] mt-4'>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password" // 'name' sangat penting
                placeholder='Input password'
                className='px-3 py-1 border-2 border-[#E2E8F0] text-[#64748B] rounded-md w-full'
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
              >
                <Image src={eyeOff} alt="Toggle password visibility" />
              </button>
            </div>
            {state.errors?.password && (
              <p className="text-red-500 text-sm ">{state.errors.password[0]}</p>
            )}

            {/* role select */}
            <label htmlFor="roleSelect" className="text-[#111827] mt-4">Role</label>
            <select 
              id="roleSelect"
              name="role" // 'name' sangat penting
              defaultValue="" // Gunakan defaultValue untuk form tak terkontrol
              className="px-3 py-2 border-2 border-[#E2E8F0] text-[#64748B] rounded-md w-full"
            >
              <option value="" disabled>Select role</option>
              <option value="Admin">Admin</option>
              <option value="User">User</option>
            </select>
            {state.errors?.role && (
              <p className="text-red-500 text-sm">{state.errors.role[0]}</p>
            )}

            <button
              type='submit'
              disabled={isPending} // Gunakan 'isPending' dari useActionState
              className='w-full bg-[#2563EB] h-10 rounded-md mt-5 text-white font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed'
            >
              {isPending ? "Registering..." : "Register"}
            </button>
          </div>
          <p className='text-[#475569]'>
            Already have an account? 
            <Link className='text-[#2563EB] underline' href='/login'>Login</Link>
          </p>
        </div>
      </div>
    </form>
  );
}