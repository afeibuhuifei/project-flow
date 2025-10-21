import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Button,
  Space,
  Table,
  Tag,
  Progress
} from 'antd'
import {
  ProjectOutlined,
  UnorderedListOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'
import { useProjectStore } from '../stores/projectStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const { Title, Text } = Typography

const Dashboard: React.FC = () => {
  const { user } = useAuthStore()
  const { projects, loading, fetchProjects } = useProjectStore()
  const navigate = useNavigate()

  React.useEffect(() => {
    fetchProjects({ limit: 5 })
  }, [fetchProjects])

  // 统计数据
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    totalTasks: projects.reduce((sum, p) => sum + (p.taskStats?.total || 0), 0),
    completedTasks: projects.reduce((sum, p) => sum + (p.taskStats?.completed || 0), 0),
    inProgressTasks: projects.reduce((sum, p) => sum + (p.taskStats?.inProgress || 0), 0)
  }

  // 最近项目表格列
  const recentProjectsColumns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          <span>{text}</span>
        </Space>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          active: { color: 'blue', text: '进行中' },
          completed: { color: 'green', text: '已完成' },
          archived: { color: 'gray', text: '已归档' }
        }
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
        return <Tag color={config.color}>{config.text}</Tag>
      }
    },
    {
      title: '任务进度',
      key: 'progress',
      render: (record: any) => {
        const { taskStats } = record
        if (!taskStats || taskStats.total === 0) {
          return <Text type="secondary">暂无任务</Text>
        }
        const percentage = Math.round((taskStats.completed / taskStats.total) * 100)
        return (
          <Progress
            percent={percentage}
            size="small"
            format={() => `${taskStats.completed}/${taskStats.total}`}
          />
        )
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/projects/${record.id}`)}
        >
          查看
        </Button>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" tip="加载仪表盘数据..." />
      </div>
    )
  }

  return (
    <div className="fade-in">
      {/* 页面标题 */}
      <div className="mb-6">
        <Title level={2} className="mb-2">
          仪表盘
        </Title>
        <Text type="secondary">
          欢迎回来，{user?.username}！这里是您的项目概览。
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总项目数"
              value={stats.totalProjects}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="进行中项目"
              value={stats.activeProjects}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已完成项目"
              value={stats.completedProjects}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={stats.totalTasks}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 任务统计 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="任务概览" extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/projects')}
            >
              新建项目
            </Button>
          }>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="待办任务"
                  value={stats.totalTasks - stats.completedTasks - stats.inProgressTasks}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="进行中"
                  value={stats.inProgressTasks}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="已完成"
                  value={stats.completedTasks}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="快速操作">
            <Space direction="vertical" className="w-full">
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={() => navigate('/projects')}
                className="w-full"
              >
                创建新项目
              </Button>
              <Button
                type="default"
                icon={<UnorderedListOutlined />}
                onClick={() => navigate('/tasks')}
                className="w-full"
              >
                查看所有任务
              </Button>
              <Button
                type="default"
                icon={<EyeOutlined />}
                onClick={() => navigate('/kanban')}
                className="w-full"
              >
                看板视图
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 最近项目 */}
      <Card
        title="最近项目"
        extra={
          <Button type="link" onClick={() => navigate('/projects')}>
            查看全部
          </Button>
        }
      >
        <Table
          columns={recentProjectsColumns}
          dataSource={projects}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: '暂无项目数据'
          }}
        />
      </Card>
    </div>
  )
}

export default Dashboard