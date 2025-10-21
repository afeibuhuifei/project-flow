import axios from 'axios'

// 创建axios实例
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('auth-storage')
    if (token) {
      try {
        const authData = JSON.parse(token)
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`
        }
      } catch (error) {
        console.error('解析认证信息失败:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // 处理401未授权错误
    if (error.response?.status === 401) {
      // 清除本地存储的认证信息
      localStorage.removeItem('auth-storage')
      // 重定向到登录页面
      window.location.href = '/login'
    }

    // 处理网络错误
    if (!error.response) {
      error.message = '网络连接失败，请检查网络设置'
    }

    return Promise.reject(error)
  }
)

// API响应类型定义
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// 导出API实例
export default api