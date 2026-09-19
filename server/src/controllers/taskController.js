import Task from '../models/Task.js';
import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get all tasks with comprehensive filtering and search
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res, next) => {
  try {
    const {
      project,
      assignee,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    let query = {};

    if (project && project !== 'all') {
      query.project = project;
    }

    if (assignee && assignee !== 'all') {
      query.assignee = assignee;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { taskCode: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const tasks = await Task.find(query)
      .populate('project', 'title key color status')
      .populate('assignee', 'name email avatar role title')
      .populate('creator', 'name email avatar role title')
      .populate('comments.user', 'name avatar role')
      .sort(sortObj);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title key color status manager members')
      .populate('assignee', 'name email avatar role title department')
      .populate('creator', 'name email avatar role title department')
      .populate('comments.user', 'name email avatar role title');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin & Manager)
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      project: projectId,
      assignee,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags,
      checklists,
    } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Target project not found with id ${projectId}`,
      });
    }

    // Generate consecutive task code based on project key
    const taskCount = await Task.countDocuments({ project: projectId });
    const taskCode = `${project.key}-${taskCount + 101}`;

    const task = await Task.create({
      title,
      taskCode,
      description: description || '',
      project: projectId,
      assignee: assignee || null,
      creator: req.user.id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate,
      estimatedHours: estimatedHours || 4,
      tags: tags || [],
      checklists: checklists || [],
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'created_task',
      entityType: 'Task',
      entityId: task._id,
      entityTitle: task.title,
      details: `Created task ${task.taskCode} in project ${project.title}`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title key color status')
      .populate('assignee', 'name email avatar role title')
      .populate('creator', 'name email avatar role title');

    res.status(201).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private (Admin, Manager, or Assignee)
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`,
      });
    }

    // Role check: If member, only allowed if assigned to this task
    if (
      req.user.role === 'member' &&
      (!task.assignee || task.assignee.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: 'Team members can only modify tasks assigned directly to them.',
      });
    }

    const previousStatus = task.status;

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('project', 'title key color status')
      .populate('assignee', 'name email avatar role title')
      .populate('creator', 'name email avatar role title')
      .populate('comments.user', 'name avatar role');

    // If status changed, log explicit status change event
    if (req.body.status && req.body.status !== previousStatus) {
      await ActivityLog.create({
        user: req.user.id,
        action: 'status_changed',
        entityType: 'Task',
        entityId: task._id,
        entityTitle: task.title,
        details: `Moved task status from '${previousStatus}' to '${req.body.status}'`,
      });
    } else {
      await ActivityLog.create({
        user: req.user.id,
        action: 'updated_task',
        entityType: 'Task',
        entityId: task._id,
        entityTitle: task.title,
        details: `Updated task details`,
      });
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status specifically (e.g., from Kanban board move)
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['backlog', 'todo', 'in_progress', 'in_review', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`,
      });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await ActivityLog.create({
      user: req.user.id,
      action: status === 'completed' ? 'completed_task' : 'status_changed',
      entityType: 'Task',
      entityId: task._id,
      entityTitle: task.title,
      details: `Changed task status from '${oldStatus}' to '${status}'`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('project', 'title key color status')
      .populate('assignee', 'name email avatar role title')
      .populate('creator', 'name email avatar role title');

    res.status(200).json({
      success: true,
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Comment text cannot be empty',
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`,
      });
    }

    task.comments.push({
      user: req.user.id,
      text,
    });

    await task.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'added_comment',
      entityType: 'Task',
      entityId: task._id,
      entityTitle: task.title,
      details: `Commented: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
    });

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'title key color status')
      .populate('assignee', 'name email avatar role title')
      .populate('comments.user', 'name email avatar role title');

    res.status(201).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or add checklist item
// @route   PUT /api/tasks/:id/checklist
// @access  Private
export const updateChecklist = async (req, res, next) => {
  try {
    const { checklists } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`,
      });
    }

    task.checklists = checklists;
    await task.save();

    await ActivityLog.create({
      user: req.user.id,
      action: 'updated_checklist',
      entityType: 'Task',
      entityId: task._id,
      entityTitle: task.title,
      details: `Updated task acceptance checklist items`,
    });

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin & Manager)
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task not found with id ${req.params.id}`,
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
      message: 'Task removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
