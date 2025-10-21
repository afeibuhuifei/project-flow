import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { successResponse, errorResponse, serverErrorResponse, notFoundResponse } from '../utils/response.js';

/**
 * 获取任务列表
 */
export async function getTasks(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const {
      page = 1,
      limit = 20,
      projectId,
      status,
      priority,
      assigneeId,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // 构建查询条件
    const where: any = {};

    // 如果指定了项目ID，需要验证项目权限
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: Number(projectId),
          ownerId: req.user.id
        }
      });

      if (!project) {
        errorResponse(res, '项目不存在或无权限访问');
        return;
      }

      where.projectId = Number(projectId);
    } else {
      // 如果没有指定项目，只返回用户拥有的项目中的任务
      where.project = {
        ownerId: req.user.id
      };
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    if (priority && priority !== 'all') {
      where.priority = priority;
    }

    if (assigneeId && assigneeId !== 'all') {
      where.assigneeId = Number(assigneeId);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    // 构建排序条件
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder;

    // 获取任务列表
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          project: {
            select: {
              id: true,
              name: true
            }
          },
          assignee: {
            select: {
              id: true,
              username: true
            }
          },
          dependencies: {
            include: {
              dependsOnTask: {
                select: {
                  id: true,
                  title: true,
                  status: true
                }
              }
            }
          },
          dependents: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  status: true
                }
              }
            }
          },
          _count: {
            select: {
              files: true
            }
          }
        }
      }),
      prisma.task.count({ where })
    ]);

    successResponse(res, '获取任务列表成功', {
      tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取任务列表错误:', error);
    serverErrorResponse(res, '获取任务列表失败');
  }
}

/**
 * 根据ID获取单个任务
 */
export async function getTaskById(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      errorResponse(res, '任务ID格式不正确');
      return;
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: req.user.id
        }
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignee: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        dependencies: {
          include: {
            dependsOnTask: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true
              }
            }
          }
        },
        dependents: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true
              }
            }
          }
        },
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            createdAt: true
          }
        }
      }
    });

    if (!task) {
      notFoundResponse(res, '任务不存在');
      return;
    }

    successResponse(res, '获取任务成功', { task });
  } catch (error) {
    console.error('获取任务错误:', error);
    serverErrorResponse(res, '获取任务失败');
  }
}

/**
 * 创建新任务
 */
export async function createTask(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const {
      title,
      description,
      projectId,
      status = 'todo',
      priority = 'medium',
      startDate,
      endDate,
      assigneeId,
      parentTaskId,
      dependencies = []
    } = req.body;

    // 验证必填字段
    if (!title || title.trim().length === 0) {
      errorResponse(res, '任务标题不能为空');
      return;
    }

    if (!projectId) {
      errorResponse(res, '项目ID不能为空');
      return;
    }

    if (title.length > 200) {
      errorResponse(res, '任务标题不能超过200个字符');
      return;
    }

    if (description && description.length > 2000) {
      errorResponse(res, '任务描述不能超过2000个字符');
      return;
    }

    // 验证项目权限
    const project = await prisma.project.findFirst({
      where: {
        id: Number(projectId),
        ownerId: req.user.id
      }
    });

    if (!project) {
      errorResponse(res, '项目不存在或无权限访问');
      return;
    }

    // 验证状态
    const validStatuses = ['todo', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      errorResponse(res, '无效的任务状态');
      return;
    }

    // 验证优先级
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      errorResponse(res, '无效的任务优先级');
      return;
    }

    // 验证日期
    let start = startDate ? new Date(startDate) : null;
    let end = endDate ? new Date(endDate) : null;

    if (start && isNaN(start.getTime())) {
      errorResponse(res, '开始日期格式不正确');
      return;
    }

    if (end && isNaN(end.getTime())) {
      errorResponse(res, '结束日期格式不正确');
      return;
    }

    if (start && end && start > end) {
      errorResponse(res, '开始日期不能晚于结束日期');
      return;
    }

    // 验证负责人（如果提供了）
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: Number(assigneeId) }
      });

      if (!assignee) {
        errorResponse(res, '指定的负责人不存在');
        return;
      }
    }

    // 验证父任务（如果提供了）
    if (parentTaskId) {
      const parentTask = await prisma.task.findFirst({
        where: {
          id: Number(parentTaskId),
          project: {
            ownerId: req.user.id
          }
        }
      });

      if (!parentTask) {
        errorResponse(res, '指定的父任务不存在');
        return;
      }
    }

    // 创建任务
    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status,
        priority,
        startDate: start,
        endDate: end,
        progress: status === 'completed' ? 100 : 0,
        projectId: Number(projectId),
        assigneeId: assigneeId ? Number(assigneeId) : null,
        parentTaskId: parentTaskId ? Number(parentTaskId) : null
      },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignee: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    // 创建任务依赖关系
    if (dependencies.length > 0) {
      const dependencyData = dependencies.map((depId: number) => ({
        taskId: task.id,
        dependsOnTaskId: depId
      }));

      await prisma.taskDependency.createMany({
        data: dependencyData
      });
    }

    successResponse(res, '任务创建成功', { task }, 201);
  } catch (error) {
    console.error('创建任务错误:', error);
    serverErrorResponse(res, '创建任务失败');
  }
}

/**
 * 更新任务
 */
export async function updateTask(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const taskId = Number(id);
    const {
      title,
      description,
      status,
      priority,
      startDate,
      endDate,
      assigneeId,
      progress
    } = req.body;

    if (isNaN(taskId)) {
      errorResponse(res, '任务ID格式不正确');
      return;
    }

    // 检查任务是否存在且用户有权限
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: req.user.id
        }
      }
    });

    if (!existingTask) {
      notFoundResponse(res, '任务不存在');
      return;
    }

    // 验证输入
    if (title !== undefined && title.trim().length === 0) {
      errorResponse(res, '任务标题不能为空');
      return;
    }

    if (title && title.length > 200) {
      errorResponse(res, '任务标题不能超过200个字符');
      return;
    }

    if (description && description.length > 2000) {
      errorResponse(res, '任务描述不能超过2000个字符');
      return;
    }

    // 验证状态
    if (status) {
      const validStatuses = ['todo', 'in_progress', 'completed'];
      if (!validStatuses.includes(status)) {
        errorResponse(res, '无效的任务状态');
        return;
      }
    }

    // 验证优先级
    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (!validPriorities.includes(priority)) {
        errorResponse(res, '无效的任务优先级');
        return;
      }
    }

    // 验证进度
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      errorResponse(res, '进度必须在0-100之间');
      return;
    }

    // 验证日期
    let start = startDate !== undefined ? (startDate ? new Date(startDate) : null) : undefined;
    let end = endDate !== undefined ? (endDate ? new Date(endDate) : null) : undefined;

    if (start && isNaN(start.getTime())) {
      errorResponse(res, '开始日期格式不正确');
      return;
    }

    if (end && isNaN(end.getTime())) {
      errorResponse(res, '结束日期格式不正确');
      return;
    }

    if (start && end && start > end) {
      errorResponse(res, '开始日期不能晚于结束日期');
      return;
    }

    // 验证负责人（如果提供了）
    if (assigneeId !== undefined) {
      if (assigneeId) {
        const assignee = await prisma.user.findUnique({
          where: { id: Number(assigneeId) }
        });

        if (!assignee) {
          errorResponse(res, '指定的负责人不存在');
          return;
        }
      }
    }

    // 构建更新数据
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (start !== undefined) updateData.startDate = start;
    if (end !== undefined) updateData.endDate = end;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId ? Number(assigneeId) : null;
    if (progress !== undefined) updateData.progress = Number(progress);

    // 如果状态变为完成，自动设置进度为100%
    if (status === 'completed') {
      updateData.progress = 100;
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        },
        assignee: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });

    successResponse(res, '任务更新成功', { task });
  } catch (error) {
    console.error('更新任务错误:', error);
    serverErrorResponse(res, '更新任务失败');
  }
}

/**
 * 删除任务
 */
export async function deleteTask(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const taskId = Number(id);

    if (isNaN(taskId)) {
      errorResponse(res, '任务ID格式不正确');
      return;
    }

    // 检查任务是否存在且用户有权限
    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          ownerId: req.user.id
        }
      }
    });

    if (!existingTask) {
      notFoundResponse(res, '任务不存在');
      return;
    }

    // 删除任务（级联删除依赖关系、文件等）
    await prisma.task.delete({
      where: { id: taskId }
    });

    successResponse(res, '任务删除成功');
  } catch (error) {
    console.error('删除任务错误:', error);
    serverErrorResponse(res, '删除任务失败');
  }
}

/**
 * 批量更新任务状态
 */
export async function batchUpdateTaskStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { taskIds, status, progress } = req.body;

    if (!Array.isArray(taskIds) || taskIds.length === 0) {
      errorResponse(res, '任务ID列表不能为空');
      return;
    }

    if (!status) {
      errorResponse(res, '状态不能为空');
      return;
    }

    // 验证状态
    const validStatuses = ['todo', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
      errorResponse(res, '无效的任务状态');
      return;
    }

    // 验证进度
    if (progress !== undefined && (progress < 0 || progress > 100)) {
      errorResponse(res, '进度必须在0-100之间');
      return;
    }

    // 构建更新数据
    const updateData: any = { status };
    if (progress !== undefined) {
      updateData.progress = Number(progress);
    } else if (status === 'completed') {
      updateData.progress = 100;
    }

    // 批量更新任务
    const result = await prisma.task.updateMany({
      where: {
        id: { in: taskIds.map(Number) },
        project: {
          ownerId: req.user.id
        }
      },
      data: updateData
    });

    successResponse(res, '批量更新任务状态成功', {
      updatedCount: result.count
    });
  } catch (error) {
    console.error('批量更新任务状态错误:', error);
    serverErrorResponse(res, '批量更新任务状态失败');
  }
}

/**
 * 添加任务依赖关系
 */
export async function addTaskDependency(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { taskId, dependsOnTaskId } = req.body;

    if (!taskId || !dependsOnTaskId) {
      errorResponse(res, '任务ID和依赖任务ID不能为空');
      return;
    }

    if (taskId === dependsOnTaskId) {
      errorResponse(res, '任务不能依赖自己');
      return;
    }

    // 检查任务权限
    const [task, dependsOnTask] = await Promise.all([
      prisma.task.findFirst({
        where: {
          id: Number(taskId),
          project: {
            ownerId: req.user.id
          }
        }
      }),
      prisma.task.findFirst({
        where: {
          id: Number(dependsOnTaskId),
          project: {
            ownerId: req.user.id
          }
        }
      })
    ]);

    if (!task || !dependsOnTask) {
      errorResponse(res, '任务不存在或无权限访问');
      return;
    }

    // 检查依赖关系是否已存在
    const existingDependency = await prisma.taskDependency.findUnique({
      where: {
        taskId_dependsOnTaskId: {
          taskId: Number(taskId),
          dependsOnTaskId: Number(dependsOnTaskId)
        }
      }
    });

    if (existingDependency) {
      errorResponse(res, '任务依赖关系已存在');
      return;
    }

    // 创建依赖关系
    await prisma.taskDependency.create({
      data: {
        taskId: Number(taskId),
        dependsOnTaskId: Number(dependsOnTaskId)
      }
    });

    successResponse(res, '任务依赖关系添加成功');
  } catch (error) {
    console.error('添加任务依赖关系错误:', error);
    serverErrorResponse(res, '添加任务依赖关系失败');
  }
}

/**
 * 删除任务依赖关系
 */
export async function removeTaskDependency(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { taskId, dependsOnTaskId } = req.body;

    if (!taskId || !dependsOnTaskId) {
      errorResponse(res, '任务ID和依赖任务ID不能为空');
      return;
    }

    // 删除依赖关系
    const result = await prisma.taskDependency.deleteMany({
      where: {
        taskId: Number(taskId),
        dependsOnTaskId: Number(dependsOnTaskId),
        task: {
          project: {
            ownerId: req.user.id
          }
        }
      }
    });

    if (result.count === 0) {
      errorResponse(res, '任务依赖关系不存在');
      return;
    }

    successResponse(res, '任务依赖关系删除成功');
  } catch (error) {
    console.error('删除任务依赖关系错误:', error);
    serverErrorResponse(res, '删除任务依赖关系失败');
  }
}