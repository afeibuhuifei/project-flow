import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const Kanban: React.FC = () => {
  return (
    <div className="fade-in">
      <Title level={2}>看板视图</Title>
      <Card>
        <p>看板功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default Kanban