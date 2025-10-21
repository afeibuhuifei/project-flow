// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  createdAt: Date
  updatedAt: Date
}

export interface UserCreateInput {
  username: string
  password: string
  email?: string
}

export interface UserLoginInput {
  username: string
  password: string
}

export interface AuthResponse {
  user: Omit<User, 'password'>
  token: string
}

// 项目相关类型
export interface Project {
  id: number
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  startDate?: Date
  endDate?: Date
  ownerId: number
  createdAt: Date
  updatedAt: Date
  owner?: User
  tasks?: Task[]
}

export interface ProjectCreateInput {
  name: string
  description?: string
  startDate?: Date
  endDate?: Date
}

export interface ProjectUpdateInput {
  name?: string
  description?: string
  status?: 'active' | 'completed' | 'archived'
  startDate?: Date
  endDate?: Date
}

// 任务相关类型
export interface Task {
  id: number
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: Date
  endDate?: Date
  progress: number // 0-100
  projectId: number
  assigneeId?: number
  parentTaskId?: number
  createdAt: Date
  updatedAt: Date
  project?: Project
  assignee?: User
  parentTask?: Task
  subtasks?: Task[]
  dependencies?: TaskDependency[]
  files?: TaskFile[]
}

export interface TaskCreateInput {
  title: string
  description?: string
  status?: 'todo' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: Date
  endDate?: Date
  progress?: number
  projectId: number
  assigneeId?: number
  parentTaskId?: number
}

export interface TaskUpdateInput {
  title?: string
  description?: string
  status?: 'todo' | 'in_progress' | 'completed'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: Date
  endDate?: Date
  progress?: number
  assigneeId?: number
  parentTaskId?: number
}

// 任务依赖相关类型
export interface TaskDependency {
  id: number
  taskId: number
  dependsOnTaskId: number
  createdAt: Date
  task?: Task
  dependsOnTask?: Task
}

// 文件相关类型
export interface TaskFile {
  id: number
  filename: string
  originalName: string
  filePath: string
  fileSize: number
  mimeType: string
  taskId: number
  uploadedBy: number
  createdAt: Date
  updatedAt: Date
  task?: Task
  uploader?: User
}

export interface FileUploadInput {
  taskId: number
  file: File
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// 甘特图相关类型
export interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  dependencies?: string[]
  type?: 'task' | 'milestone' | 'project'
  project?: string
  hideChildren?: boolean
  displayOrder?: number
}

// 看板相关类型
export interface KanbanColumn {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'completed'
  tasks: Task[]
  limit?: number
}

// 表单相关类型
export interface LoginFormData {
  username: string
  password: string
}

export interface ProjectFormData {
  name: string
  description?: string
  startDate?: string
  endDate?: string
}

export interface TaskFormData {
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  startDate?: string
  endDate?: string
  assigneeId?: number
  parentTaskId?: number
}

// 路由参数类型
export interface RouteParams {
  id?: string
  projectId?: string
  taskId?: string
}

// 组件 Props 类型
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ModalProps extends BaseComponentProps {
  open: boolean
  onClose: () => void
  title?: string
  width?: number
}

// 错误类型
export interface ApiError {
  message: string
  status?: number
  code?: string
}

// 加载状态类型
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// 主题类型
export type Theme = 'light' | 'dark'

// 排序类型
export type SortOrder = 'asc' | 'desc'

export interface SortOption {
  field: string
  order: SortOrder
}

// 过滤类型
export interface FilterOptions {
  status?: string[]
  priority?: string[]
  assigneeId?: number[]
  dateRange?: {
    start: Date
    end: Date
  }
}

// 搜索类型
export interface SearchOptions {
  query?: string
  filters?: FilterOptions
  sort?: SortOption
  page?: number
  limit?: number
}