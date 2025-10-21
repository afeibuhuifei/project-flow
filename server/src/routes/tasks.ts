import { Router } from 'express';
import { body } from 'express-validator';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  batchUpdateTaskStatus,
  addTaskDependency,
  removeTaskDependency
} from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 创建任务验证规则
const createTaskValidation = [
  body('title')
    .notEmpty()
    .withMessage('任务标题不能为空')
    .isLength({ max: 200 })
    .withMessage('任务标题不能超过200个字符'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('任务描述不能超过2000个字符')
    .trim(),
  body('projectId')
    .isInt({ min: 1 })
    .withMessage('项目ID必须是正整数'),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('无效的任务状态'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('无效的任务优先级'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确'),
  body('assigneeId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('负责人ID必须是正整数'),
  body('parentTaskId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('父任务ID必须是正整数'),
  body('dependencies')
    .optional()
    .isArray()
    .withMessage('依赖任务列表必须是数组'),
  body('dependencies.*')
    .optional()
    .isInt({ min: 1 })
    .withMessage('依赖任务ID必须是正整数')
];

// 更新任务验证规则
const updateTaskValidation = [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('任务标题不能为空')
    .isLength({ max: 200 })
    .withMessage('任务标题不能超过200个字符'),
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('任务描述不能超过2000个字符')
    .trim(),
  body('status')
    .optional()
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('无效的任务状态'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('无效的任务优先级'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('开始日期格式不正确'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('结束日期格式不正确'),
  body('assigneeId')
    .optional()
    .isInt({ min: 0 })
    .withMessage('负责人ID必须是非负整数'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('进度必须在0-100之间')
];

// 批量更新验证规则
const batchUpdateValidation = [
  body('taskIds')
    .isArray({ min: 1 })
    .withMessage('任务ID列表不能为空'),
  body('taskIds.*')
    .isInt({ min: 1 })
    .withMessage('任务ID必须是正整数'),
  body('status')
    .isIn(['todo', 'in_progress', 'completed'])
    .withMessage('无效的任务状态'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('进度必须在0-100之间')
];

// 添加依赖关系验证规则
const addDependencyValidation = [
  body('taskId')
    .isInt({ min: 1 })
    .withMessage('任务ID必须是正整数'),
  body('dependsOnTaskId')
    .isInt({ min: 1 })
    .withMessage('依赖任务ID必须是正整数')
];

// 删除依赖关系验证规则
const removeDependencyValidation = [
  body('taskId')
    .isInt({ min: 1 })
    .withMessage('任务ID必须是正整数'),
  body('dependsOnTaskId')
    .isInt({ min: 1 })
    .withMessage('依赖任务ID必须是正整数')
];

// 路由定义
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTaskValidation, validate, createTask);
router.put('/:id', updateTaskValidation, validate, updateTask);
router.delete('/:id', deleteTask);
router.patch('/batch-update', batchUpdateValidation, validate, batchUpdateTaskStatus);
router.post('/dependencies', addDependencyValidation, validate, addTaskDependency);
router.delete('/dependencies', removeDependencyValidation, validate, removeTaskDependency);

export default router;