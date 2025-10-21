import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const Files: React.FC = () => {
  return (
    <div className="fade-in">
      <Title level={2}>文件管理</Title>
      <Card>
        <p>文件管理功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default Files