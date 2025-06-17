"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from 'next/image';
import Link from 'next/link';
import api from '@/app/axios';
import logoipsum from '../../../public/logoIpsum.svg';
import eyeOff from '../../../public/eye-off.svg'

export default function Login() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [InputData, SetInputData] = useState<{ username: string; password: string }>({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const validate = () => {
    const newErrors: { username?: string; password?: string } = {};
    if (!InputData.username.trim()) {
      newErrors.username = "Please enter your username";
    }
    if (!InputData.password) {
      newErrors.password = "Please enter your password";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginAction = async () => {
  try {
    setIsSubmitting(true);
    const response = await api.post('/auth/login', {
      username: InputData.username,
      password: InputData.password
    });

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('role', response.data.role);
    localStorage.setItem('password',InputData.password)

    const userRole = response.data.role;
    if (userRole === 'Admin') {
      router.push('/admin/articles');
    } else if (userRole === 'User') {
      router.push('/user/articles');
    } else {
      router.push('/');
    }
  } catch (error: any) {
    // Assuming error response has data with message and fields (depends on your API)
    if (error.response && error.response.data) {
      const apiErrors = error.response.data.errors || {};
      setErrors(prev => ({
        ...prev,
        username: apiErrors.username || '',
        password: apiErrors.password || 'Invalid username or password',
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        password: 'Login failed. Please try again.',
      }));
    }
    // Don't use alert; show message below inputs instead
  } finally {
    setIsSubmitting(false);
  }
};


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSubmitting && validate()) {
      loginAction();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='flex justify-center items-center w-screen h-screen m-0 p-0 bg-[#F3F4F6]'>
        <div className=' flex flex-col justify-center items-center w-[400px] h-[452px] bg-white p-6 rounded-md shadow-md'>
          <Image
            src={logoipsum}
            alt='logoipsum'
          />
          <div className='flex flex-col justify-center w-[368px] gap-2 mt-10 mb-10 relative'>
            <label htmlFor="username" className='text-[#111827]'>Username</label>
            <input
              type="text" 
              id="username"
              placeholder='Input username'
              value={InputData.username}
              onChange={e => SetInputData(prev => ({ ...prev, username: e.target.value }))}
              className='px-3 py-1 border-2 border-[#E2E8F0] text-[#64748B] rounded-md'
              
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
            <label htmlFor="password" className='text-[#111827] mt-4'>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder='Input password'
                value={InputData.password}
                onChange={e => SetInputData(prev => ({ ...prev, password: e.target.value }))}
                className='px-3 py-1 border-2 border-[#E2E8F0] text-[#64748B] rounded-md w-full pr-10'
                
              />
              {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
              {/* Tombol ikon show/hide */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <span role="img" aria-label="Hide Password">
                    <Image
                    src={eyeOff}
                    alt="eye off"
                    />
                  </span>
                ) : (
                  <span role="img" aria-label="Show Password">
                    <Image
                    src={eyeOff}
                    alt="eye off"
                    />
                  </span>
                )}
              </button>
              
            </div>
            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full bg-[#2563EB] h-10 rounded-md mt-5 text-white font-semibold'
            >
              Login
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
