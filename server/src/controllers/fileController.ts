import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '../config/database.js';
import { successResponse, errorResponse, serverErrorResponse, notFoundResponse } from '../utils/response.js';

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');

    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: (req, file, cb) => {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// 文件过滤器
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // 允许的文件类型
  const allowedTypes = [
    // 图片
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // 文档
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    // 文本
    'text/plain',
    'text/csv',
    // 压缩文件
    'application/zip',
    'application/x-rar-compressed',
    // 代码文件
    'text/javascript',
    'application/json',
    'text/html',
    'text/css',
    'application/xml',
    'text/xml'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('不支持的文件类型'));
  }
};

// 配置multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // 最多5个文件
  }
});

/**
 * 上传文件到任务
 */
export async function uploadFiles(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { taskId } = req.body;

    if (!taskId) {
      errorResponse(res, '任务ID不能为空');
      return;
    }

    // 检查任务是否存在且用户有权限
    const task = await prisma.task.findFirst({
      where: {
        id: Number(taskId),
        project: {
          ownerId: req.user.id
        }
      }
    });

    if (!task) {
      errorResponse(res, '任务不存在或无权限访问');
      return;
    }

    // 使用multer中间件处理文件上传
    upload.array('files', 5)(req, res, async (err) => {
      if (err) {
        console.error('文件上传错误:', err);
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              errorResponse(res, '文件大小不能超过10MB');
              return;
            case 'LIMIT_FILE_COUNT':
              errorResponse(res, '一次最多上传5个文件');
              return;
            case 'LIMIT_UNEXPECTED_FILE':
              errorResponse(res, '上传的文件数量超出限制');
              return;
            default:
              errorResponse(res, '文件上传失败');
              return;
          }
        } else {
          errorResponse(res, err.message || '文件上传失败');
          return;
        }
      }

      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        errorResponse(res, '没有上传文件');
        return;
      }

      try {
        // 保存文件信息到数据库
        const fileRecords = await Promise.all(
          files.map(async (file) => {
            return await prisma.taskFile.create({
              data: {
                filename: file.filename,
                originalName: file.originalname,
                filePath: file.path,
                fileSize: file.size,
                mimeType: file.mimetype,
                taskId: Number(taskId),
                uploadedBy: req.user!.id
              }
            });
          })
        );

        successResponse(res, '文件上传成功', {
          files: fileRecords.map(file => ({
            id: file.id,
            filename: file.filename,
            originalName: file.originalName,
            fileSize: file.fileSize,
            mimeType: file.mimeType,
            downloadUrl: `/api/files/download/${file.id}`,
            uploadedAt: file.createdAt
          }))
        });
      } catch (dbError) {
        console.error('保存文件信息错误:', dbError);
        // 删除已上传的文件
        await Promise.all(
          files.map(async (file) => {
            try {
              await fs.unlink(file.path);
            } catch (unlinkError) {
              console.error('删除文件失败:', unlinkError);
            }
          })
        );
        serverErrorResponse(res, '保存文件信息失败');
      }
    });
  } catch (error) {
    console.error('上传文件错误:', error);
    serverErrorResponse(res, '上传文件失败');
  }
}

/**
 * 获取任务文件列表
 */
export async function getTaskFiles(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { taskId } = req.params;

    if (!taskId) {
      errorResponse(res, '任务ID不能为空');
      return;
    }

    // 检查任务是否存在且用户有权限
    const task = await prisma.task.findFirst({
      where: {
        id: Number(taskId),
        project: {
          ownerId: req.user.id
        }
      }
    });

    if (!task) {
      errorResponse(res, '任务不存在或无权限访问');
      return;
    }

    // 获取文件列表
    const files = await prisma.taskFile.findMany({
      where: { taskId: Number(taskId) },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            username: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    successResponse(res, '获取文件列表成功', {
      files: files.map(file => ({
        id: file.id,
        filename: file.filename,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        downloadUrl: `/api/files/download/${file.id}`,
        uploadedBy: file.uploadedByUser,
        uploadedAt: file.createdAt
      }))
    });
  } catch (error) {
    console.error('获取文件列表错误:', error);
    serverErrorResponse(res, '获取文件列表失败');
  }
}

/**
 * 下载文件
 */
export async function downloadFile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const fileId = Number(id);

    if (isNaN(fileId)) {
      errorResponse(res, '文件ID格式不正确');
      return;
    }

    // 获取文件信息
    const file = await prisma.taskFile.findFirst({
      where: {
        id: fileId,
        task: {
          project: {
            ownerId: req.user.id
          }
        }
      }
    });

    if (!file) {
      notFoundResponse(res, '文件不存在');
      return;
    }

    // 检查文件是否存在
    try {
      await fs.access(file.filePath);
    } catch (accessError) {
      errorResponse(res, '文件已被删除');
      return;
    }

    // 设置响应头
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.setHeader('Content-Length', file.fileSize.toString());

    // 发送文件
    const fileStream = require('fs').createReadStream(file.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('下载文件错误:', error);
    serverErrorResponse(res, '下载文件失败');
  }
}

/**
 * 删除文件
 */
export async function deleteFile(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const fileId = Number(id);

    if (isNaN(fileId)) {
      errorResponse(res, '文件ID格式不正确');
      return;
    }

    // 获取文件信息
    const file = await prisma.taskFile.findFirst({
      where: {
        id: fileId,
        task: {
          project: {
            ownerId: req.user.id
          }
        }
      }
    });

    if (!file) {
      notFoundResponse(res, '文件不存在');
      return;
    }

    // 删除数据库记录
    await prisma.taskFile.delete({
      where: { id: fileId }
    });

    // 删除物理文件
    try {
      await fs.unlink(file.filePath);
    } catch (unlinkError) {
      console.error('删除物理文件失败:', unlinkError);
      // 即使物理文件删除失败，也不影响API响应
    }

    successResponse(res, '文件删除成功');
  } catch (error) {
    console.error('删除文件错误:', error);
    serverErrorResponse(res, '删除文件失败');
  }
}

/**
 * 获取文件预览信息
 */
export async function getFilePreview(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const fileId = Number(id);

    if (isNaN(fileId)) {
      errorResponse(res, '文件ID格式不正确');
      return;
    }

    // 获取文件信息
    const file = await prisma.taskFile.findFirst({
      where: {
        id: fileId,
        task: {
          project: {
            ownerId: req.user.id
          }
        }
      }
    });

    if (!file) {
      notFoundResponse(res, '文件不存在');
      return;
    }

    // 根据文件类型返回不同的预览信息
    const previewInfo: any = {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      fileSize: file.fileSize,
      mimeType: file.mimeType,
      uploadedAt: file.createdAt
    };

    // 如果是图片，提供预览URL
    if (file.mimeType.startsWith('image/')) {
      previewInfo.previewUrl = `/api/files/preview/${file.id}`;
      previewInfo.isImage = true;
    } else {
      previewInfo.isImage = false;
      // 根据MIME类型提供文件类型描述
      const typeDescriptions: Record<string, string> = {
        'application/pdf': 'PDF文档',
        'application/msword': 'Word文档',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word文档',
        'application/vnd.ms-excel': 'Excel表格',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel表格',
        'text/plain': '文本文件',
        'application/zip': '压缩文件'
      };
      previewInfo.fileType = typeDescriptions[file.mimeType] || '未知类型';
    }

    successResponse(res, '获取文件预览信息成功', { file: previewInfo });
  } catch (error) {
    console.error('获取文件预览信息错误:', error);
    serverErrorResponse(res, '获取文件预览信息失败');
  }
}

// 导出multer中间件供路由使用
export { upload };