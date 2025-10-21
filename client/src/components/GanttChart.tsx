import React, { useState, useEffect, useCallback } from 'react'
import { Card, Spin, Alert, Button, Space, Select, DatePicker, Tooltip } from 'antd'
import { ViewOptions, Gantt, Task, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import '../styles/gantt.css'
import { taskService, Task as TaskType, GanttTask } from '../services/taskService'
import dayjs from 'dayjs'
import { ReloadOutlined, CalendarOutlined, ProjectOutlined } from '@ant-design/icons'

const { Option } = Select
const { RangePicker } = DatePicker

interface GanttChartProps {
  projectId?: number
  height?: number
}

const GanttChart: React.FC<GanttChartProps> = ({
  projectId,
  height = 500
}) => {
  const [tasks, setTasks] = useState<GanttTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Day)
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)

  // 加载任务数据
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let taskData: TaskType[]
      if (projectId) {
        taskData = await taskService.getTasksByProject(projectId)
      } else {
        taskData = await taskService.getTasks()
      }

      // 调试：打印API返回的数据结构
      console.log('API Response:', taskData)

      const ganttTasks = taskService.convertTasksToGanttFormat(taskData)
      console.log('Converted Gantt Tasks:', ganttTasks)
      setTasks(ganttTasks)
    } catch (err: any) {
      setError(err.message || '加载任务数据失败')
      console.error('Failed to load tasks:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  // 处理任务更新
  const handleTaskChange = async (task: Task) => {
    try {
      await taskService.updateTask(parseInt(task.id), {
        startDate: dayjs(task.start).format('YYYY-MM-DD'),
        endDate: dayjs(task.end).format('YYYY-MM-DD'),
        progress: task.progress
      })

      // 重新加载数据
      await loadTasks()
    } catch (err: any) {
      console.error('Failed to update task:', err)
      // 可以添加错误提示
    }
  }

  // 处理任务进度更新
  const handleProgressChange = async (task: Task) => {
    try {
      await taskService.updateTaskProgress(parseInt(task.id), task.progress)
      await loadTasks()
    } catch (err: any) {
      console.error('Failed to update task progress:', err)
    }
  }

  // 处理双击任务
  const handleTaskDoubleClick = (task: Task) => {
    // 可以打开任务详情弹窗
    console.log('Task double clicked:', task)
  }

  // 处理选中任务
  const handleSelectTask = (task: Task | undefined) => {
    if (task) {
      console.log('Task selected:', task)
    }
  }

  // 处理日期范围变化
  const handleDateRangeChange = (dates: any) => {
    setDateRange(dates)
  }

  // 获取甘特图的日期范围
  const getGanttDateRange = () => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      return {
        start: dateRange[0].toDate(),
        end: dateRange[1].toDate()
      }
    }
    return undefined
  }

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={loadTasks}>
              重试
            </Button>
          }
        />
      </Card>
    )
  }

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <CalendarOutlined />
            甘特图视图
            {tasks.length > 0 && (
              <span className="text-sm text-gray-500">
                ({tasks.length} 个任务)
              </span>
            )}
          </span>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadTasks}
            loading={loading}
            size="small"
          >
            刷新
          </Button>
        </div>
      }
      extra={
        <Space>
          <Select
            value={viewMode}
            onChange={setViewMode}
            style={{ width: 120 }}
            size="small"
          >
            <Option value={ViewMode.Day}>日视图</Option>
            <Option value={ViewMode.Week}>周视图</Option>
            <Option value={ViewMode.Month}>月视图</Option>
            <Option value={ViewMode.QuarterQuarter}>季度视图</Option>
          </Select>
          <Tooltip title="选择日期范围">
            <RangePicker
              value={dateRange}
              onChange={handleDateRangeChange}
              size="small"
            />
          </Tooltip>
        </Space>
      }
    >
      {tasks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <ProjectOutlined className="text-4xl mb-4" />
          <p>暂无任务数据</p>
          <p className="text-sm">请先创建一些任务来查看甘特图</p>
        </div>
      ) : (
        <div style={{ overflow: 'auto' }}>
          <Gantt
            tasks={tasks}
            viewMode={viewMode}
            locale="zh-CN"
            onDateChange={handleTaskChange}
            onProgressChange={handleProgressChange}
            onDoubleClick={handleTaskDoubleClick}
            onSelect={handleSelectTask}
            listCellWidth="155px"
            barProgressColor="#1890ff"
            barProgressSelectedColor="#096dd9"
            barBackgroundColor="#f0f0f0"
            barBackgroundSelectedColor="#e6f7ff"
            projectProgressColor="#52c41a"
            projectProgressSelectedColor="#389e0d"
            milestoneBackgroundColor="#faad14"
            milestoneBackgroundSelectedColor="#d48806"
            rtl={false}
            handleWidth={8}
            barFill={60}
            barCornerRadius={3}
            arrowColor="#1890ff"
            arrowIndent={20}
            fontSize="14px"
            fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
            PreTaskCount={0}
            ganttHeight={height}
            columnWidth={60}
            rowHeight={50}
            viewDate={getGanttDateRange()}
          />
        </div>
      )}
    </Card>
  )
}

export default GanttChart