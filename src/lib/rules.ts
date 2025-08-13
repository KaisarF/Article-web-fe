import { z } from 'zod'; 

export const registerSchema = z.object({
  username: z.string().min(1, { message: "Please enter your username" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),

  role: z.enum(['Admin', 'User'], {
    errorMap: () => ({ message: "Please select your role" }),
  }),
});

export const loginSchema = z.object({
      username: z.string().trim().min(1, { message: "Please enter your username" }),
      password: z.string().min(6, { message: "Password must be at least 6 characters" }),
}) 

export const inputArticleSchema = z.object({
  title:z.string().trim()
})