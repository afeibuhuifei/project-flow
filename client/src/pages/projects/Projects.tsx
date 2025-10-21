import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const Projects: React.FC = () => {
  return (
    <div className="fade-in">
      <Title level={2}>项目管理</Title>
      <Card>
        <p>项目管理功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default Projects