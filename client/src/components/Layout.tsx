import React, { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Layout as AntLayout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  theme
} from 'antd'
import {
  DashboardOutlined,
  ProjectOutlined,
  TaskOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  FileOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined
} from '@ant-design/icons'
import { useAuthStore } from '../stores/authStore'

const { Header, Sider, Content } = AntLayout

const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const {
    token: { colorBgContainer }
  } = theme.useToken()

  // 菜单配置
  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘'
    },
    {
      key: '/projects',
      icon: <ProjectOutlined />,
      label: '项目管理'
    },
    {
      key: '/tasks',
      icon: <TaskOutlined />,
      label: '任务管理'
    },
    {
      type: 'divider'
    },
    {
      key: 'kanban',
      icon: <AppstoreOutlined />,
      label: '看板视图',
      children: [
        {
          key: '/kanban',
          label: '所有项目'
        }
      ]
    },
    {
      key: 'gantt',
      icon: <BarChartOutlined />,
      label: '甘特图',
      children: [
        {
          key: '/gantt',
          label: '所有项目'
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      key: '/files',
      icon: <FileOutlined />,
      label: '文件管理'
    }
  ]

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => navigate('/settings')
    },
    {
      type: 'divider' as const
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout
    }
  ]

  // 处理菜单点击
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname
    if (path.startsWith('/kanban')) return ['/kanban']
    if (path.startsWith('/gantt')) return ['/gantt']
    if (path.startsWith('/projects/') && path !== '/projects') {
      return ['/projects']
    }
    if (path.startsWith('/tasks/') && path !== '/tasks') {
      return ['/tasks']
    }
    return [path]
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 bg-blue-600 text-white">
          {!collapsed ? (
            <h1 className="text-lg font-bold">ProjectFlow</h1>
          ) : (
            <span className="text-lg font-bold">PF</span>
          )}
        </div>

        {/* 菜单 */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={handleMenuClick}
          className="border-r-0"
        />
      </Sider>

      {/* 主内容区 */}
      <AntLayout style={{ marginLeft: collapsed ? 80 : 200 }}>
        {/* 顶部导航 */}
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)'
          }}
        >
          {/* 左侧：折叠按钮 */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />

          {/* 右侧：用户信息 */}
          <Space>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space className="cursor-pointer hover:bg-gray-50 px-3 py-2 rounded">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  src={user?.avatar}
                />
                <span className="hidden sm:inline">
                  {user?.username || '用户'}
                </span>
              </Space>
            </Dropdown>
          </Space>
        </Header>

        {/* 页面内容 */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: 8,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout