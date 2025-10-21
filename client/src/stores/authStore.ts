import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useEffect } from 'react'
import { api } from '../services/api'

interface User {
  id: number
  username: string
  email?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string, email?: string) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (data: Partial<User>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      loading: false,
      isAuthenticated: false,

      // Actions
      setLoading: (loading: boolean) => {
        set({ loading })
      },

      login: async (username: string, password: string) => {
        try {
          set({ loading: true })

          const response = await api.post('/auth/login', {
            username,
            password
          })

          const { user, token } = response.data.data

          // 设置API默认认证头
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          })
        } catch (error: any) {
          set({ loading: false })
          throw new Error(error.response?.data?.message || '登录失败')
        }
      },

      register: async (username: string, password: string, email?: string) => {
        try {
          set({ loading: true })

          const response = await api.post('/auth/register', {
            username,
            password,
            email
          })

          const { user, token } = response.data.data

          // 设置API默认认证头
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false
          })
        } catch (error: any) {
          set({ loading: false })
          throw new Error(error.response?.data?.message || '注册失败')
        }
      },

      logout: () => {
        // 清除API默认认证头
        delete api.defaults.headers.common['Authorization']

        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        })
      },

      checkAuth: async () => {
        const { token } = get()

        if (!token) {
          set({ loading: false })
          return
        }

        try {
          set({ loading: true })

          // 设置认证头
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

          const response = await api.get('/auth/me')
          const { user } = response.data.data

          set({
            user,
            isAuthenticated: true,
            loading: false
          })
        } catch (error) {
          // Token无效，清除认证状态
          delete api.defaults.headers.common['Authorization']
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false
          })
        }
      },

      updateUser: async (data: Partial<User>) => {
        try {
          const response = await api.put('/auth/me', data)
          const { user } = response.data.data

          set({ user })
        } catch (error: any) {
          throw new Error(error.response?.data?.message || '更新用户信息失败')
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        try {
          await api.put('/auth/change-password', {
            currentPassword,
            newPassword
          })
        } catch (error: any) {
          throw new Error(error.response?.data?.message || '修改密码失败')
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// 认证状态初始化hook
export const useAuthInit = () => {
  const { checkAuth, loading } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return { loading }
}