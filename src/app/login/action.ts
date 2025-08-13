"use client"; 


import { redirect } from 'next/navigation';

import api from '@/app/axios'; 
import { loginSchema } from '@/lib/rules'; 
import Cookies from 'js-cookie';

type LoginState = {
  errors?: {
    username?: string[];
    password?: string[];
  };
  message?: string;
};

export async function loginAction(
  previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const rawData = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const validatedFields = loginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    console.log(validatedFields.data)
    for (const key of formData.keys()) {
  console.log('FormData key:', key);
}
    const response = await api.post('/auth/login',{
        username: validatedFields.data.username,
        password: validatedFields.data.password,
    });
    const { token, role } = response.data;

    
    if (!token || !role) {
      throw new Error("Invalid response from server.");
    }

    Cookies.set('password',validatedFields.data.password)
    Cookies.set('token', token, { expires: 7 });
    Cookies.set('role', role, { expires: 7 });

  } catch (error) {
    console.error("Login API Error:", error);


    return {
      message: "Invalid username or password. Please try again.",
    };
  }


  const roleFromCookie = Cookies.get('role');
  if (roleFromCookie === 'Admin') {
    redirect('/admin/articles');
  } else if (roleFromCookie === 'User') {
    redirect('/user/articles');
  } else {
    redirect('/login');
  }
}
