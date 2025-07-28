'use server'

import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {z} from 'zod'

import { SignupState } from '@/lib/definations'
import {SignupSchema} from '@/lib/zod/schemas'
import {createClient} from '@/utils/supabase/server'

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState>{
    const supabase = await createClient();
    const rawData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    }

    const validation = SignupSchema.safeParse(rawData)
    if(!validation.success){
        const fieldErrors = z.flattenError(validation.error).fieldErrors
        return {
            error: 'Invalid form data. Please check the fields and try again',
            errors: fieldErrors
        }
    }

    const {fullName, email, password} = validation.data
    const {error: signupError} = await supabase.auth.signUp({
        email,
        password,
        options:{
            data: {
                full_name: fullName
            }
        }
    })
    if(signupError){
        return {
            error: 'Could not authenticate user',
            errors: {_form: [signupError.message]}
        }
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check email to continue sign in process')
}