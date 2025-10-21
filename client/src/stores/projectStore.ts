import { create } from 'zustand'
import { api } from '../services/api'

interface Project {
  id: number
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  startDate?: string
  endDate?: string
  ownerId: number
  createdAt: string
  updatedAt: string
  tasks?: any[]
  taskStats?: {
    total: number
    completed: number
    inProgress: number
    todo: number
  }
  _count?: {
    tasks: number
  }
}

interface ProjectFilters {
  page: number
  limit: number
  status: string
  search: string
}

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  filters: ProjectFilters
}

interface ProjectActions {
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setFilters: (filters: Partial<ProjectFilters>) => void
  fetchProjects: (filters?: Partial<ProjectFilters>) => Promise<void>
  fetchProjectById: (id: number) => Promise<void>
  createProject: (data: Omit<Project, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<Project>
  updateProject: (id: number, data: Partial<Project>) => Promise<Project>
  deleteProject: (id: number) => Promise<void>
  clearCurrentProject: () => void
}

type ProjectStore = ProjectState & ProjectActions

export const useProjectStore = create<ProjectStore>((set, get) => ({
  // State
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  },
  filters: {
    page: 1,
    limit: 10,
    status: 'all',
    search: ''
  },

  // Actions
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setFilters: (newFilters) => {
    const currentFilters = get().filters
    set({ filters: { ...currentFilters, ...newFilters } })
  },

  fetchProjects: async (filters) => {
    try {
      set({ loading: true, error: null })

      const finalFilters = { ...get().filters, ...filters }
      const params = new URLSearchParams()

      Object.entries(finalFilters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString())
        }
      })

      const response = await api.get(`/projects?${params}`)
      const { projects, pagination } = response.data.data

      set({
        projects,
        pagination,
        filters: finalFilters,
        loading: false
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '获取项目列表失败'
      set({ error: errorMessage, loading: false })
      throw new Error(errorMessage)
    }
  },

  fetchProjectById: async (id) => {
    try {
      set({ loading: true, error: null })

      const response = await api.get(`/projects/${id}`)
      const { project } = response.data.data

      set({
        currentProject: project,
        loading: false
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '获取项目详情失败'
      set({ error: errorMessage, loading: false })
      throw new Error(errorMessage)
    }
  },

  createProject: async (data) => {
    try {
      set({ loading: true, error: null })

      const response = await api.post('/projects', data)
      const { project } = response.data.data

      // 更新项目列表
      const currentProjects = get().projects
      set({
        projects: [project, ...currentProjects],
        loading: false
      })

      return project
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '创建项目失败'
      set({ error: errorMessage, loading: false })
      throw new Error(errorMessage)
    }
  },

  updateProject: async (id, data) => {
    try {
      set({ loading: true, error: null })

      const response = await api.put(`/projects/${id}`, data)
      const { project } = response.data.data

      // 更新项目列表
      const currentProjects = get().projects
      const updatedProjects = currentProjects.map(p =>
        p.id === id ? project : p
      )

      // 更新当前项目
      const currentProject = get().currentProject
      if (currentProject?.id === id) {
        set({ currentProject: project })
      }

      set({
        projects: updatedProjects,
        loading: false
      })

      return project
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '更新项目失败'
      set({ error: errorMessage, loading: false })
      throw new Error(errorMessage)
    }
  },

  deleteProject: async (id) => {
    try {
      set({ loading: true, error: null })

      await api.delete(`/projects/${id}`)

      // 更新项目列表
      const currentProjects = get().projects
      const filteredProjects = currentProjects.filter(p => p.id !== id)

      // 清除当前项目
      const currentProject = get().currentProject
      if (currentProject?.id === id) {
        set({ currentProject: null })
      }

      set({
        projects: filteredProjects,
        loading: false
      })
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '删除项目失败'
      set({ error: errorMessage, loading: false })
      throw new Error(errorMessage)
    }
  },

  clearCurrentProject: () => set({ currentProject: null })
}))