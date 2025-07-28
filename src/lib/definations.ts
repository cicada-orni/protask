// SignupState
export type SignupState = {
    error?: string
    errors?: {
        fullName?: string[]
        email?: string[]
        password?: string[]
        confirmPassword?: string[]
        _form?: string[]
    }
    message?: string
}

// LoginState
export type LoginState = {
    error?: string,
    errors?: {
        email?: string[]
        password?: string[]
        _form?: string[]
    }
    message?: string

}