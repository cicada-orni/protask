import { z } from 'zod'

//Signup Schema
export const SignupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, { message: 'Name must be at least 2 characters' }),
    email: z.email({ message: 'Please enter a valid email address' }),
    password: z
      .string()
      .min(8, { message: 'Password must be atleast 8 characters long' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ['confirmPassword'],
  })

//Login Schema
export const LoginSchema = z.object({
  email: z.email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password field cannot be empty' }),
})

//Onboarding Schema
// export const OnboardingSchema = z.object({
//     workspaceName: z.string().min(3, {message: 'Workspace name must be at least 3 characters long'}),
//     projectName: z.string().min(3, {message: 'Project name must be at least 3 characters long'}),
//     boardName: z.string().min(3, {message: 'Board name must be at least 3 characters long'})
// })

//AddComment Schema
export const AddCommentSchema = z.object({
  content: z.string().min(1, { message: 'Comment cannot be empty.' }),
  task_id: z.uuid({ message: 'Invalid Task ID.' }),
})
