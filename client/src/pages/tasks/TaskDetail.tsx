import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const TaskDetail: React.FC = () => {
  return (
    <div className="fade-in">
      <Title level={2}>任务详情</Title>
      <Card>
        <p>任务详情页面正在开发中...</p>
      </Card>
    </div>
  )
}

export default TaskDetail