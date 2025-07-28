'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {z} from 'zod'

import { LoginState } from '@/lib/definations'
import { LoginSchema } from '@/lib/zod/schemas'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: LoginState, formData: FormData):Promise<LoginState>{
    const supabase = await createClient()
    const rawData = {
        email: formData.get('email'),
        password: formData.get('password')
    }

    const validation = LoginSchema.safeParse(rawData)
    if(!validation.success) {
        const fieldErrors = z.flattenError(validation.error).fieldErrors
        return {
            error: 'Inavlid form data. Please check the field and try again',
            errors: fieldErrors
        }
    }
    const {email, password} = validation.data

    const {error: loginError} = await supabase.auth.signInWithPassword({
        email, password
    })
    if(loginError){
        return {
            error: 'Log in failed',
            errors: {_form: [loginError.message]}
        }
    }
    revalidatePath('/', 'layout')
    redirect('/')
}