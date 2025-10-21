import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getCurrentUser,
  updateUser,
  changePassword
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// 注册验证规则
const registerValidation = [
  body('username')
    .isLength({ min: 2, max: 50 })
    .withMessage('用户名长度必须在2-50个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('密码长度至少6个字符'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail()
];

// 登录验证规则
const loginValidation = [
  body('username')
    .notEmpty()
    .withMessage('用户名不能为空'),
  body('password')
    .notEmpty()
    .withMessage('密码不能为空')
];

// 更新用户信息验证规则
const updateUserValidation = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('邮箱格式不正确')
    .normalizeEmail()
];

// 修改密码验证规则
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('当前密码不能为空'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('新密码长度至少6个字符')
];

// 公开路由（不需要认证）
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);

// 需要认证的路由
router.get('/me', authenticate, getCurrentUser);
router.put('/me', authenticate, updateUserValidation, validate, updateUser);
router.put('/change-password', authenticate, changePasswordValidation, validate, changePassword);

export default router;