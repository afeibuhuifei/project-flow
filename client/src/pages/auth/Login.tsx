import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Space
} from 'antd'
import { UserOutlined, LockOutlined, ProjectOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../stores/authStore'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const { Title, Text } = Typography

interface LoginForm {
  username: string
  password: string
}

const Login: React.FC = () => {
  const [form] = Form.useForm()
  const [error, setError] = useState<string>('')
  const navigate = useNavigate()
  const { login, loading } = useAuthStore()

  const handleSubmit = async (values: LoginForm) => {
    try {
      setError('')
      await login(values.username, values.password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <Card
        className="w-full max-w-md shadow-xl"
        style={{
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <ProjectOutlined className="text-white text-2xl" />
            </div>
          </div>
          <Title level={2} className="mb-2">
            ProjectFlow
          </Title>
          <Text type="secondary">
            现代化项目管理平台
          </Text>
        </div>

        {/* 错误提示 */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-6"
            closable
            onClose={() => setError('')}
          />
        )}

        {/* 登录表单 */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 2, message: '用户名至少2个字符' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-base font-medium"
              style={{ borderRadius: '8px' }}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
          </Form.Item>
        </Form>

        {/* 底部链接 */}
        <div className="text-center">
          <Space split={<span className="text-gray-300">|</span>}>
            <Link to="/register" className="text-blue-600 hover:text-blue-700">
              注册账号
            </Link>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              忘记密码
            </a>
          </Space>
        </div>

        {/* 测试账号提示 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <Text type="secondary" className="text-sm">
            <strong>测试账号：</strong>
            <br />
            用户名：123
            <br />
            密码：123
          </Text>
        </div>
      </Card>
    </div>
  )
}

export default Login