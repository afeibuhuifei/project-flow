import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/response.js';

/**
 * 验证中间件 - 检查express-validator的验证结果
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    errorResponse(res, errorMessages.join(', '));
    return;
  }

  next();
}