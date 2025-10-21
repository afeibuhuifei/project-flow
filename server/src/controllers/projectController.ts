import { Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { successResponse, errorResponse, serverErrorResponse, notFoundResponse } from '../utils/response.js';

/**
 * 获取用户的所有项目
 */
export async function getProjects(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // 构建查询条件
    const where: any = {
      ownerId: req.user.id
    };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    // 获取项目列表
    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
        include: {
          tasks: {
            select: {
              id: true,
              status: true
            }
          },
          _count: {
            select: {
              tasks: true
            }
          }
        }
      }),
      prisma.project.count({ where })
    ]);

    // 计算任务统计
    const projectsWithStats = projects.map(project => ({
      ...project,
      taskStats: {
        total: project.tasks.length,
        completed: project.tasks.filter(task => task.status === 'completed').length,
        inProgress: project.tasks.filter(task => task.status === 'in_progress').length,
        todo: project.tasks.filter(task => task.status === 'todo').length
      }
    }));

    successResponse(res, '获取项目列表成功', {
      projects: projectsWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('获取项目列表错误:', error);
    serverErrorResponse(res, '获取项目列表失败');
  }
}

/**
 * 根据ID获取单个项目
 */
export async function getProjectById(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const projectId = Number(id);

    if (isNaN(projectId)) {
      errorResponse(res, '项目ID格式不正确');
      return;
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: req.user.id
      },
      include: {
        tasks: {
          include: {
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
                    title: true
                  }
                }
              }
            },
            dependents: {
              include: {
                task: {
                  select: {
                    id: true,
                    title: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      notFoundResponse(res, '项目不存在');
      return;
    }

    successResponse(res, '获取项目成功', { project });
  } catch (error) {
    console.error('获取项目错误:', error);
    serverErrorResponse(res, '获取项目失败');
  }
}

/**
 * 创建新项目
 */
export async function createProject(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { name, description, startDate, endDate, status = 'active' } = req.body;

    // 验证输入
    if (!name || name.trim().length === 0) {
      errorResponse(res, '项目名称不能为空');
      return;
    }

    if (name.length > 100) {
      errorResponse(res, '项目名称不能超过100个字符');
      return;
    }

    if (description && description.length > 1000) {
      errorResponse(res, '项目描述不能超过1000个字符');
      return;
    }

    // 验证状态
    const validStatuses = ['active', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      errorResponse(res, '无效的项目状态');
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

    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        startDate: start,
        endDate: end,
        status,
        ownerId: req.user.id
      },
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    successResponse(res, '项目创建成功', { project }, 201);
  } catch (error) {
    console.error('创建项目错误:', error);
    serverErrorResponse(res, '创建项目失败');
  }
}

/**
 * 更新项目
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const projectId = Number(id);
    const { name, description, startDate, endDate, status } = req.body;

    if (isNaN(projectId)) {
      errorResponse(res, '项目ID格式不正确');
      return;
    }

    // 检查项目是否存在且属于当前用户
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: req.user.id
      }
    });

    if (!existingProject) {
      notFoundResponse(res, '项目不存在');
      return;
    }

    // 验证输入
    if (name && name.trim().length === 0) {
      errorResponse(res, '项目名称不能为空');
      return;
    }

    if (name && name.length > 100) {
      errorResponse(res, '项目名称不能超过100个字符');
      return;
    }

    if (description && description.length > 1000) {
      errorResponse(res, '项目描述不能超过1000个字符');
      return;
    }

    // 验证状态
    if (status) {
      const validStatuses = ['active', 'completed', 'archived'];
      if (!validStatuses.includes(status)) {
        errorResponse(res, '无效的项目状态');
        return;
      }
    }

    // 验证日期
    let start = startDate ? new Date(startDate) : undefined;
    let end = endDate ? new Date(endDate) : undefined;

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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (start !== undefined) updateData.startDate = start;
    if (end !== undefined) updateData.endDate = end;
    if (status !== undefined) updateData.status = status;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });

    successResponse(res, '项目更新成功', { project });
  } catch (error) {
    console.error('更新项目错误:', error);
    serverErrorResponse(res, '更新项目失败');
  }
}

/**
 * 删除项目
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const projectId = Number(id);

    if (isNaN(projectId)) {
      errorResponse(res, '项目ID格式不正确');
      return;
    }

    // 检查项目是否存在且属于当前用户
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: req.user.id
      }
    });

    if (!existingProject) {
      notFoundResponse(res, '项目不存在');
      return;
    }

    // 删除项目（级联删除相关的任务、依赖关系和文件）
    await prisma.project.delete({
      where: { id: projectId }
    });

    successResponse(res, '项目删除成功');
  } catch (error) {
    console.error('删除项目错误:', error);
    serverErrorResponse(res, '删除项目失败');
  }
}

/**
 * 获取项目统计信息
 */
export async function getProjectStats(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      errorResponse(res, '用户未登录');
      return;
    }

    const { id } = req.params;
    const projectId = Number(id);

    if (isNaN(projectId)) {
      errorResponse(res, '项目ID格式不正确');
      return;
    }

    // 检查项目是否存在且属于当前用户
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: req.user.id
      },
      include: {
        tasks: {
          include: {
            assignee: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    });

    if (!project) {
      notFoundResponse(res, '项目不存在');
      return;
    }

    // 计算统计信息
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'completed').length;
    const inProgressTasks = project.tasks.filter(task => task.status === 'in_progress').length;
    const todoTasks = project.tasks.filter(task => task.status === 'todo').length;

    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 按优先级统计
    const tasksByPriority = project.tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按负责人统计
    const tasksByAssignee = project.tasks.reduce((acc, task) => {
      const assigneeName = task.assignee?.username || '未分配';
      acc[assigneeName] = (acc[assigneeName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    successResponse(res, '获取项目统计成功', {
      stats: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overallProgress,
        tasksByPriority,
        tasksByAssignee,
        projectDuration: {
          startDate: project.startDate,
          endDate: project.endDate,
          daysElapsed: project.startDate ? Math.ceil((Date.now() - project.startDate.getTime()) / (1000 * 60 * 60 * 24)) : null
        }
      }
    });
  } catch (error) {
    console.error('获取项目统计错误:', error);
    serverErrorResponse(res, '获取项目统计失败');
  }
}