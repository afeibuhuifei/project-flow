import { PrismaClient } from '@prisma/client';

// 创建Prisma客户端实例
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty'
});

// 测试数据库连接
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('✅ 数据库连接成功');
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    process.exit(1);
  }
}

// 优雅关闭数据库连接
async function disconnect() {
  try {
    await prisma.$disconnect();
    console.log('✅ 数据库连接已关闭');
  } catch (error) {
    console.error('❌ 关闭数据库连接时出错:', error);
  }
}

// 退出时自动关闭数据库连接
process.on('SIGINT', disconnect);
process.on('SIGTERM', disconnect);

export { prisma, testConnection, disconnect };