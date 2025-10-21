import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const Tasks: React.FC = () => {
  return (
    <div className="fade-in">
      <Title level={2}>任务管理</Title>
      <Card>
        <p>任务管理功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default Tasks