import { api } from './api'

export interface Task {
  id: number
  title: string
  description?: string
  status: string
  priority: string
  startDate?: string
  endDate?: string
  progress: number
  projectId: number
  assigneeId?: number
  parentTaskId?: number
  createdAt: string
  updatedAt: string
  assignee?: {
    id: number
    username: string
  }
  project: {
    id: number
    name: string
  }
  dependencies?: TaskDependency[]
  dependents?: TaskDependency[]
  subtasks?: Task[]
}

export interface TaskDependency {
  id: number
  taskId: number
  dependsOnTaskId: number
  createdAt: string
}

export interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  dependencies?: string[]
  type: 'task' | 'milestone' | 'project'
  hideChildren?: boolean
  displayOrder?: number
  project?: string
  color?: string
  styles?: {
    backgroundColor?: string
    backgroundSelectedColor?: string
    progressColor?: string
    progressSelectedColor?: string
  }
}

export interface CreateTaskData {
  title: string
  description?: string
  status: string
  priority: string
  startDate?: string
  endDate?: string
  progress?: number
  projectId: number
  assigneeId?: number
  parentTaskId?: number
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  progress?: number
}

class TaskService {
  // 获取所有任务
  async getTasks(): Promise<Task[]> {
    const response = await api.get('/tasks')
    // 检查返回的数据格式
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (response.data.tasks && Array.isArray(response.data.tasks)) {
      return response.data.tasks
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    console.warn('Unexpected tasks data format:', response.data)
    // 尝试从不同的数据结构中提取数组
    if (response.data && typeof response.data === 'object') {
      for (const key in response.data) {
        if (Array.isArray(response.data[key])) {
          console.log(`Found tasks array in key: ${key}`, response.data[key])
          return response.data[key]
        }
      }
    }
    return []
  }

  // 根据项目获取任务
  async getTasksByProject(projectId: number): Promise<Task[]> {
    const response = await api.get(`/projects/${projectId}/tasks`)
    // 检查返回的数据格式
    if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data
    }
    if (response.data.tasks && Array.isArray(response.data.tasks)) {
      return response.data.tasks
    }
    if (Array.isArray(response.data)) {
      return response.data
    }
    console.warn('Unexpected project tasks data format:', response.data)
    return []
  }

  // 获取单个任务详情
  async getTask(id: number): Promise<Task> {
    const response = await api.get(`/tasks/${id}`)
    return response.data.data
  }

  // 创建任务
  async createTask(data: CreateTaskData): Promise<Task> {
    const response = await api.post('/tasks', data)
    return response.data.data
  }

  // 更新任务
  async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data.data
  }

  // 删除任务
  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`)
  }

  // 更新任务进度
  async updateTaskProgress(id: number, progress: number): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/progress`, { progress })
    return response.data.data
  }

  // 获取任务依赖
  async getTaskDependencies(taskId: number): Promise<TaskDependency[]> {
    const response = await api.get(`/tasks/${taskId}/dependencies`)
    return response.data.data
  }

  // 添加任务依赖
  async addTaskDependency(taskId: number, dependsOnTaskId: number): Promise<TaskDependency> {
    const response = await api.post(`/tasks/${taskId}/dependencies`, {
      dependsOnTaskId
    })
    return response.data.data
  }

  // 移除任务依赖
  async removeTaskDependency(taskId: number, dependencyId: number): Promise<void> {
    await api.delete(`/tasks/${taskId}/dependencies/${dependencyId}`)
  }

  // 转换任务为甘特图格式
  convertTasksToGanttFormat(tasks: Task[] | any): GanttTask[] {
    if (!Array.isArray(tasks)) {
      console.warn('Tasks data is not an array:', tasks)
      return []
    }

    return tasks.map(task => ({
      id: task.id.toString(),
      name: task.title,
      start: new Date(task.startDate || task.createdAt),
      end: new Date(task.endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 默认7天后
      progress: task.progress,
      dependencies: task.dependencies?.map(dep => dep.dependsOnTaskId.toString()),
      type: task.progress === 100 ? 'milestone' : 'task',
      project: task.project.name,
      color: this.getTaskColor(task.priority),
      styles: {
        backgroundColor: this.getTaskColor(task.priority),
        progressColor: task.progress === 100 ? '#52c41a' : '#1890ff'
      }
    }))
  }

  // 根据优先级获取任务颜色
  private getTaskColor(priority: string): string {
    switch (priority) {
      case 'urgent':
        return '#ff4d4f'
      case 'high':
        return '#ff7a45'
      case 'medium':
        return '#ffa940'
      case 'low':
        return '#52c41a'
      default:
        return '#1890ff'
    }
  }
}

export const taskService = new TaskService()