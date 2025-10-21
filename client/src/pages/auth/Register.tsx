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
import { UserOutlined, LockOutlined, MailOutlined, ProjectOutlined } from '@ant-design/icons'
import { useAuthStore } from '../../stores/authStore'

const { Title, Text } = Typography

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword: string
}

const Register: React.FC = () => {
  const [form] = Form.useForm()
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const navigate = useNavigate()
  const { register, loading } = useAuthStore()

  const handleSubmit = async (values: RegisterForm) => {
    try {
      setError('')
      setSuccess('')
      await register(values.username, values.password, values.email)
      setSuccess('注册成功！正在跳转到登录页面...')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1500)
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
            注册账号
          </Title>
          <Text type="secondary">
            创建您的ProjectFlow账户
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

        {/* 成功提示 */}
        {success && (
          <Alert
            message={success}
            type="success"
            showIcon
            className="mb-6"
            closable
            onClose={() => setSuccess('')}
          />
        )}

        {/* 注册表单 */}
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
              { min: 2, max: 50, message: '用户名长度必须在2-50个字符之间' },
              { pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, message: '用户名只能包含字母、数字、下划线和中文' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入用户名"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱（可选）"
            rules={[
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="请输入邮箱"
              autoComplete="email"
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
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请再次输入密码"
              autoComplete="new-password"
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
              {loading ? '注册中...' : '注册'}
            </Button>
          </Form.Item>
        </Form>

        {/* 底部链接 */}
        <div className="text-center">
          <Space split={<span className="text-gray-300">|</span>}>
            <Link to="/login" className="text-blue-600 hover:text-blue-700">
              已有账号？登录
            </Link>
            <a href="#" className="text-blue-600 hover:text-blue-700">
              使用帮助
            </a>
          </Space>
        </div>
      </Card>
    </div>
  )
}

export default Register