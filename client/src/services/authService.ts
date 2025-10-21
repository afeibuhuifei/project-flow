import { api } from './api'

export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  username: string
  password: string
  email?: string
}

export interface User {
  id: number
  username: string
  email?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const authService = {
  // 用户登录
  login: async (data: LoginRequest) => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  // 用户注册
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // 更新用户信息
  updateUser: async (data: Partial<User>) => {
    const response = await api.put('/auth/me', data)
    return response.data
  },

  // 修改密码
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const response = await api.put('/auth/change-password', data)
    return response.data
  }
}