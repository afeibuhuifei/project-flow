import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const ProjectDetail: React.FC = () => {
  return (
    <div className="fade-in">
      <Title level={2}>项目详情</Title>
      <Card>
        <p>项目详情页面正在开发中...</p>
      </Card>
    </div>
  )
}

export default ProjectDetail