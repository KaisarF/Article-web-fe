"use client"; 


import { redirect } from 'next/navigation';

import api from '@/app/axios'; // Pastikan path ini benar dan instance axios dikonfigurasi
import { loginSchema } from '@/lib/rules'; // Impor skema Zod untuk login
import Cookies from 'js-cookie';
// Tipe untuk state yang akan dikembalikan oleh action
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
        username: formData.get("username"),
        password: formData.get("password"),
    });
    const { token, role } = response.data;

    // Periksa jika response tidak sesuai dengan yang diharapkan
    if (!token || !role) {
      throw new Error("Invalid response from server.");
    }

    // Simpan token dan role di cookies
    Cookies.set('token', token, { expires: 7 });
    Cookies.set('role', role, { expires: 7 });

  } catch (error) {
    console.error("Login API Error:", error);

    // Berikan pesan kesalahan yang lebih informatif
    return {
      message: "Invalid username or password. Please try again.",
    };
  }

  // Redirect berdasarkan role yang ada
  const roleFromCookie = Cookies.get('role');
  if (roleFromCookie === 'Admin') {
    redirect('/admin/articles');
  } else if (roleFromCookie === 'User') {
    redirect('/user/articles');
  } else {
    redirect('/login');
  }
}
