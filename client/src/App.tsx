import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Projects from './pages/projects/Projects'
import ProjectDetail from './pages/projects/ProjectDetail'
import Tasks from './pages/tasks/Tasks'
import TaskDetail from './pages/tasks/TaskDetail'
import Kanban from './pages/kanban/Kanban'
import Gantt from './pages/gantt/Gantt'
import Files from './pages/files/Files'
import Profile from './pages/profile/Profile'
import LoadingSpinner from './components/ui/LoadingSpinner'

function App() {
  const { user, loading, checkAuth } = useAuthStore()

  // 应用启动时检查认证状态
  React.useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="App">
      <Routes>
        {/* 公开路由 */}
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        {/* 受保护的路由 */}
        <Route
          path="/"
          element={user ? <Layout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/:id" element={<TaskDetail />} />
          <Route path="kanban/:projectId?" element={<Kanban />} />
          <Route path="gantt/:projectId?" element={<Gantt />} />
          <Route path="files" element={<Files />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404页面 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-4">页面不存在</p>
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  返回上一页
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  )
}

export default App