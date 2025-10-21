import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始数据库种子数据初始化...')

  // 创建测试用户
  const hashedPassword = await bcrypt.hash('123', 10)

  const testUser = await prisma.user.upsert({
    where: { username: '123' },
    update: {},
    create: {
      username: '123',
      password: hashedPassword,
      email: 'user@projectflow.com',
    },
  })

  console.log('测试用户已创建:', { id: testUser.id, username: testUser.username })

  // 创建示例项目
  const sampleProject = await prisma.project.create({
    data: {
      name: 'ProjectFlow 开发项目',
      description: '开发一个现代化的项目管理平台',
      status: 'active',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      ownerId: testUser.id,
    },
  })

  console.log('示例项目已创建:', { id: sampleProject.id, name: sampleProject.name })

  // 创建示例任务
  const tasks = [
    {
      title: '项目需求分析',
      description: '分析用户需求，制定功能规格',
      status: 'completed' as const,
      priority: 'high' as const,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-07'),
      progress: 100,
      projectId: sampleProject.id,
      assigneeId: testUser.id,
    },
    {
      title: '技术栈选型',
      description: '选择合适的前后端技术栈',
      status: 'completed' as const,
      priority: 'high' as const,
      startDate: new Date('2024-01-08'),
      endDate: new Date('2024-01-14'),
      progress: 100,
      projectId: sampleProject.id,
      assigneeId: testUser.id,
    },
    {
      title: '前端开发',
      description: '开发 React 前端应用',
      status: 'in_progress' as const,
      priority: 'high' as const,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-02-15'),
      progress: 60,
      projectId: sampleProject.id,
      assigneeId: testUser.id,
    },
    {
      title: '后端API开发',
      description: '开发 Express 后端API',
      status: 'in_progress' as const,
      priority: 'high' as const,
      startDate: new Date('2024-01-20'),
      endDate: new Date('2024-02-20'),
      progress: 40,
      projectId: sampleProject.id,
      assigneeId: testUser.id,
    },
    {
      title: '数据库设计',
      description: '设计数据库模式和关系',
      status: 'completed' as const,
      priority: 'medium' as const,
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-12'),
      progress: 100,
      projectId: sampleProject.id,
      assigneeId: testUser.id,
    },
    {
      title: '甘特图集成',
      description: '集成甘特图组件库',
      status: 'todo' as const,
      priority: 'medium' as const,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-10'),
      progress: 0,
      projectId: sampleProject.id,
      assigneeId: testUser.id,
    },
    {
      title: '看板功能实现',
      description: '实现拖拽式看板功能',
      status: 'todo' as const,
      priority: 'medium' as const,
      startDate: new Date('2024-02-05'),
      endDate: new Date('2024-02-15'),
      progress: 0,
      projectId: sampleProject.id,
      assigneeId: testUser.id,
    },
    {
      title: '文件管理功能',
      description: '实现文件上传和管理功能',
      status: 'todo' as const,
      priority: 'low' as const,
      startDate: new Date('2024-02-15'),
      endDate: new Date('2024-02-25'),
      progress: 0,
      projectId: sampleProject.id,
      assigneeId: testUser.id,
    },
  ]

  const createdTasks = []
  for (const taskData of tasks) {
    const task = await prisma.task.create({ data: taskData })
    createdTasks.push(task)
    console.log(`任务已创建: ${task.title}`)
  }

  // 创建任务依赖关系
  const dependencies = [
    { taskId: createdTasks[2].id, dependsOnTaskId: createdTasks[0].id }, // 前端开发依赖需求分析
    { taskId: createdTasks[3].id, dependsOnTaskId: createdTasks[4].id }, // 后端开发依赖数据库设计
    { taskId: createdTasks[5].id, dependsOnTaskId: createdTasks[2].id }, // 甘特图集成依赖前端开发
    { taskId: createdTasks[6].id, dependsOnTaskId: createdTasks[2].id }, // 看板功能依赖前端开发
    { taskId: createdTasks[7].id, dependsOnTaskId: createdTasks[3].id }, // 文件管理依赖后端开发
  ]

  for (const dep of dependencies) {
    await prisma.taskDependency.create({ data: dep })
    console.log(`任务依赖已创建: 任务${dep.taskId} 依赖 任务${dep.dependsOnTaskId}`)
  }

  console.log('数据库种子数据初始化完成!')
  console.log('\n登录信息:')
  console.log('用户名: 123')
  console.log('密码: 123')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('种子数据初始化失败:', e)
    await prisma.$disconnect()
    process.exit(1)
  })