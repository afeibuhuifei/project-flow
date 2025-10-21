import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入配置
import { testConnection } from './config/database.js';

// 导入路由
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import taskRoutes from './routes/tasks.js';
import fileRoutes from './routes/files.js';

// 配置环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5175',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ProjectFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// 404错误处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🚀 ProjectFlow API服务器运行在端口 ${PORT}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/api/health`);
      console.log(`🔑 登录测试: 用户名=123, 密码=123`);
      console.log(`📁 文件上传目录: ${path.join(__dirname, '../uploads')}`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();

export default app;