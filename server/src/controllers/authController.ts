import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { successResponse, errorResponse, serverErrorResponse } from '../utils/response.js';

/**
 * 用户注册
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { username, password, email } = req.body;

    // 验证输入
    if (!username || !password) {
      errorResponse(res, '用户名和密码不能为空');
      return;
    }

    if (username.length < 2 || username.length > 50) {
      errorResponse(res, '用户名长度必须在2-50个字符之间');
      return;
    }

    if (password.length < 6) {
      errorResponse(res, '密码长度至少6个字符');
      return;
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      errorResponse(res, '用户名已存在');
      return;
    }

    // 检查邮箱是否已存在（如果提供了邮箱）
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email }
      });

      if (existingEmail) {
        errorResponse(res, '邮箱已被使用');
        return;
      }
    }

    // 加密密码
    const hashedPassword = await hashPassword(password);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email: email || null
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    // 生成JWT令牌
    const token = generateToken(user);

    successResponse(res, '注册成功', {
      user,
      token
    }, 201);
  } catch (error) {
    console.error('注册错误:', error);
    serverErrorResponse(res, '注册失败');
  }
}

/**
 * 用户登录
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      errorResponse(res, '用户名和密码不能为空');
      return;
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      errorResponse(res, '用户名或密码错误');
      return;
    }

    // 验证密码
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      errorResponse(res, '用户名或密码错误');
      return;
    }

    // 生成JWT令牌
    const token = generateToken(user);

    // 返回用户信息（不包含密码）
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt
    };

    successResponse(res, '登录成功', {
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('登录错误:', error);
    serverErrorResponse(res, '登录失败');
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      errorResponse(res, '用户不存在');
      return;
    }

    successResponse(res, '获取用户信息成功', { user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    serverErrorResponse(res, '获取用户信息失败');
  }
}

/**
 * 更新用户信息
 */
export async function updateUser(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { email } = req.body;
    const userId = req.user.id;

    // 检查邮箱是否已被其他用户使用
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          id: { not: userId }
        }
      });

      if (existingEmail) {
        errorResponse(res, '邮箱已被其他用户使用');
        return;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(email && { email })
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    successResponse(res, '用户信息更新成功', { user: updatedUser });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    serverErrorResponse(res, '更新用户信息失败');
  }
}

/**
 * 修改密码
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // 验证输入
    if (!currentPassword || !newPassword) {
      errorResponse(res, '当前密码和新密码不能为空');
      return;
    }

    if (newPassword.length < 6) {
      errorResponse(res, '新密码长度至少6个字符');
      return;
    }

    // 获取用户当前密码
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      errorResponse(res, '用户不存在');
      return;
    }

    // 验证当前密码
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      errorResponse(res, '当前密码错误');
      return;
    }

    // 加密新密码
    const hashedNewPassword = await hashPassword(newPassword);

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    successResponse(res, '密码修改成功');
  } catch (error) {
    console.error('修改密码错误:', error);
    serverErrorResponse(res, '修改密码失败');
  }
}