import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database.js';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt.js';
import { unauthorizedResponse, forbiddenResponse } from '../utils/response.js';

// 扩展Request接口以包含用户信息
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email?: string;
      };
    }
  }
}

/**
 * 认证中间件 - 验证JWT令牌
 */
export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      unauthorizedResponse(res, '缺少访问令牌');
      return;
    }

    const decoded = verifyToken(token);

    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true
      }
    });

    if (!user) {
      unauthorizedResponse(res, '用户不存在');
      return;
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    unauthorizedResponse(res, '无效的访问令牌');
  }
}

/**
 * 可选认证中间件 - 如果有令牌则验证，没有则继续
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (token) {
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true
        }
      });

      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // 可选认证失败时不阻止请求继续
    next();
  }
}