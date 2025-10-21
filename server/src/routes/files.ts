import { Router } from 'express';
import {
  uploadFiles,
  getTaskFiles,
  downloadFile,
  deleteFile,
  getFilePreview,
  upload
} from '../controllers/fileController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// 所有路由都需要认证
router.use(authenticate);

// 上传文件（使用multer中间件）
router.post('/upload', upload.array('files', 5), uploadFiles);

// 获取任务文件列表
router.get('/task/:taskId', getTaskFiles);

// 下载文件
router.get('/download/:id', downloadFile);

// 文件预览
router.get('/preview/:id', getFilePreview);

// 删除文件
router.delete('/:id', deleteFile);

export default router;