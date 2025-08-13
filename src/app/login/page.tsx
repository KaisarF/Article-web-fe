"use client";

import { useActionState, useState } from "react";
import Image from 'next/image';
import Link from 'next/link';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="flex justify-center items-center w-screen h-screen m-0 p-0 bg-[#F3F4F6]">
      <Card className="w-[400px] p-6 flex flex-col justify-center items-center">
        <CardContent className="flex flex-col items-center">
          <Image
            src={logoipsum}
            alt='logoipsum'
          />
          <form action={formAction}>
            <div className='flex flex-col justify-center w-[368px] gap-2 mt-10  relative'>
              <Label htmlFor="username" className='text-[#111827]'>Username</Label>
              <Input
                type="text" 
                id="username"
                name="username" 
                placeholder='Input username'
                className='px-3 py-1 border-2 border-[#E2E8F0] text-[#64748B] rounded-md'
              />
              
              {state.errors?.username && (
                <p className="text-red-500 text-sm mt-1">{state.errors.username[0]}</p>
              )}

              <Label htmlFor="password" className='text-[#111827] mt-4'>Password</Label>
              <div className="relative">
                <Input
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

              <Button
                type='submit'
                disabled={isPending} 
                className='w-full bg-[#2563EB] h-10 rounded-md mt-5 text-white font-semibold disabled:bg-blue-300 disabled:cursor-not-allowed'
              >
                {isPending ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
          
        </CardContent>
        <CardFooter>
          <p className='text-[#475569] text-center'>
              Don’t have an account? 
              <Link className='text-[#2563EB] underline' href='/register'>Register</Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}