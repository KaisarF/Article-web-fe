"use server"; // Wajib untuk menandai ini sebagai file Server Actions


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
    const response = await api.post('/auth/login', validatedFields.data);

    const { token, role } = response.data;

    Cookies.set('token',token,{expires:7});
    Cookies.set('role',role,{expires:7});
    Cookies.set('password',validatedFields.data.password,{expires:7});

  } catch (error) {
    // Tangani jika API mengembalikan error (misal: 401 Unauthorized)
    console.error(`Login API Error: ${error}`);
    return {
      message: "Invalid username or password. Please try again.",
    };
  }

  // 5. Jika semua berhasil, redirect pengguna dari server
  const roleFromCookie = Cookies.get('role');
  if (roleFromCookie === 'Admin') {
    redirect('/admin/articles');
  } else if (roleFromCookie === 'User') {
    redirect('/user/articles');
  } else {
    redirect('/login'); 
  }
}