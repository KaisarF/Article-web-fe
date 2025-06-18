"use server"; 

import api from '@/app/axios';
import { registerSchema } from "@/lib/rules";
import { redirect } from 'next/navigation';
import { isAxiosError } from 'axios'; 

type FormState = {
    errors?: {
        username?: string[];
        password?: string[];
        role?: string[];
    };
    message?: string;
    success?: boolean;
};

export async function registerAction(
    previousState: FormState, 
    formData: FormData
): Promise<FormState> {

    const rawData = {
        username: formData.get("username"),
        password: formData.get("password"),
        role: formData.get("role"),
    };

    const validatedFields = registerSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Validation failed. Please check the fields.",
            success: false,
        };
    }
    
    try {
        const response = await api.post('/auth/register', validatedFields.data);
        console.log("Registration successful:", response.data);

    } catch (error) { 

        if (isAxiosError(error)) {

            console.error("API Error:", error.response?.data);
            const apiError = error.response?.data?.message || "Registration failed on the server.";
            return {
                message: apiError,
                success: false,
            };
        } else {

            console.error("Non-Axios Error:", error);
            return {
                message: "An unexpected error occurred. Please try again.",
                success: false,
            };
        }

    }

    redirect('/login');
}