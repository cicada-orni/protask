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
  error?: string
  errors?: {
    email?: string[]
    password?: string[]
    _form?: string[]
  }
  message?: string
}

//Tasks
export type Comment = {
  id: string
  content: string
  created_at: string
}

export type Task = {
  id: string
  title: string
  description?: string | null
  comments: Comment[]
}

export type Column = {
  id: string
  title: string
  tasks: Task[]
}

export type BoardData = Column[]
