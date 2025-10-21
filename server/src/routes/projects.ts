import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectStats
} from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 创建项目验证规则
const createProjectValidation = [
  body('name')
    .notEmpty()
    .withMessage('项目名称不能为空')
    .isLength({ max: 100 })
    .withMessage('项目名称不能超过100个字符'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('项目描述不能超过1000个字符')
    .trim(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'archived'])
    .withMessage('无效的项目状态')
];

// 更新项目验证规则
const updateProjectValidation = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('项目名称不能为空')
    .isLength({ max: 100 })
    .withMessage('项目名称不能超过100个字符'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('项目描述不能超过1000个字符')
    .trim(),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确'),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'archived'])
    .withMessage('无效的项目状态')
];

// 路由定义
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.get('/:id/stats', getProjectStats);
router.post('/', createProjectValidation, validate, createProject);
router.put('/:id', updateProjectValidation, validate, updateProject);
router.delete('/:id', deleteProject);

export default router;