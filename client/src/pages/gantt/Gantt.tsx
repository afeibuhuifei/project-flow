import React, { useState } from 'react'
import { Card, Typography, Select, Space, Button } from 'antd'
import { PlusOutlined, ProjectOutlined } from '@ant-design/icons'
import GanttChart from '../../components/GanttChart'
import { taskService } from '../../services/taskService'

const { Title } = Typography
const { Option } = Select

const Gantt: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<number | undefined>()
  const [projects, setProjects] = useState<any[]>([])

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-6">
        <Title level={2} className="flex items-center gap-2">
          <ProjectOutlined />
          甘特图
        </Title>
        <Space>
          <Select
            placeholder="选择项目"
            value={selectedProject || undefined}
            onChange={setSelectedProject}
            style={{ width: 200 }}
            allowClear
          >
            {projects.map(project => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
          <Button type="primary" icon={<PlusOutlined />}>
            新建任务
          </Button>
        </Space>
      </div>

      <GanttChart
        projectId={selectedProject}
        height={600}
      />
    </div>
  )
}

export default Gantt