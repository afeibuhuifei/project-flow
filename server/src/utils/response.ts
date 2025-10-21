import { Response } from 'express';

/**
 * 标准API响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * 成功响应
 */
export function successResponse<T>(res: Response, message: string, data?: T, statusCode: number = 200): Response {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

/**
 * 错误响应
 */
export function errorResponse(res: Response, message: string, statusCode: number = 400): Response {
  return res.status(statusCode).json({
    success: false,
    message
  });
}

/**
 * 服务器错误响应
 */
export function serverErrorResponse(res: Response, message: string = '服务器内部错误'): Response {
  return res.status(500).json({
    success: false,
    message
  });
}

/**
 * 未授权响应
 */
export function unauthorizedResponse(res: Response, message: string = '未授权访问'): Response {
  return res.status(401).json({
    success: false,
    message
  });
}

/**
 * 禁止访问响应
 */
export function forbiddenResponse(res: Response, message: string = '禁止访问'): Response {
  return res.status(403).json({
    success: false,
    message
  });
}

/**
 * 资源未找到响应
 */
export function notFoundResponse(res: Response, message: string = '资源未找到'): Response {
  return res.status(404).json({
    success: false,
    message
  });
}