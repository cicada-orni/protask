import {z} from 'zod'

//Signup Schema
export const SignupSchema = z.object({
    fullName: z.string().min(2, {message: 'Name must be at least 2 characters'}),
    email: z.email({message: 'Please enter a valid email address'}),
    password: z.string().min(8, {message: 'Password must be atleast 8 characters long'}),
    confirmPassword: z.string()
}).refine((data)=> data.password === data.confirmPassword, {message: "Password don't match", path: ['confirmPassword']})

//Login Schema
export const LoginSchema = z.object({
    email: z.email({message: 'Please enter a valid email address'}),
    password: z.string().min(1, {message: 'Password field cannot be empty'})
})