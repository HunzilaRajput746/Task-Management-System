import Project from '../models/Project.js';
import Task from '../models/Task.js';
import ActivityLog from '../models/ActivityLog.js';

// Helper to compute project progress
const attachProjectMetrics = async (projectDoc) => {
  const totalTasks = await Task.countDocuments({ project: projectDoc._id });
  const completedTasks = await Task.countDocuments({
    project: projectDoc._id,
    status: 'completed',
  });
  const inProgressTasks = await Task.countDocuments({
    project: projectDoc._id,
    status: { $in: ['in_progress', 'in_review'] },
  });

  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    ...projectDoc.toObject(),
    metrics: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      progressPercent,
    },
  };
};

// @desc    Get all projects with search & filtering
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res, next) => {
  try {
    const { search, status, priority, category } = req.query;
    let query = {};

    // Search filter across title, description, and key
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { key: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    // Role-based visibility:
    // Admin sees all.
    // Manager sees all projects.
    // Member sees projects where they are assigned or public.
    const projects = await Project.find(query)
      .populate('manager', 'name email avatar role title')
      .populate('members', 'name email avatar role title')
      .sort({ createdAt: -1 });

    const projectsWithMetrics = await Promise.all(
      projects.map((proj) => attachProjectMetrics(proj))
    );

    res.status(200).json({
      success: true,
      count: projectsWithMetrics.length,
      data: projectsWithMetrics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project by ID with tasks
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('manager', 'name email avatar role title department')
      .populate('members', 'name email avatar role title department');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Project not found with id ${req.params.id}`,
      });
    }

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email avatar role title')
      .populate('creator', 'name email avatar role title')
      .sort({ createdAt: -1 });

    const enrichedProject = await attachProjectMetrics(project);

    res.status(200).json({
      success: true,
      data: {
        ...enrichedProject,
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (Admin & Manager)
export const createProject = async (req, res, next) => {
  try {
    const {
      title,
      key,
      description,
      category,
      status,
      priority,
      manager,
      members,
      dueDate,
      startDate,
      budget,
      tags,
      color,
    } = req.body;

    const existingProject = await Project.findOne({ key: key.toUpperCase() });
    if (existingProject) {
      return res.status(400).json({
        success: false,
        error: `Project key '${key.toUpperCase()}' is already taken. Choose a unique 3-5 letter key.`,
      });
    }

    const project = await Project.create({
      title,
      key: key.toUpperCase(),
      description,
      category,
      status: status || 'in_progress',
      priority: priority || 'medium',
      manager: manager || req.user.id,
      members: members || [req.user.id],
      dueDate,
      startDate: startDate || Date.now(),
      budget: budget || 0,
      tags: tags || [],
      color: color || '#6366F1',
    });

    await ActivityLog.create({
      user: req.user.id,
      action: 'created_project',
      entityType: 'Project',
      entityId: project._id,
      entityTitle: project.title,
      details: `Project created with key ${project.key}`,
    });

    const populatedProject = await Project.findById(project._id)
      .populate('manager', 'name email avatar role title')
      .populate('members', 'name email avatar role title');

    res.status(201).json({
      success: true,
      data: populatedProject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin & Manager)
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Project not found with id ${req.params.id}`,
      });
    }

    // Role check: If manager, ensure they are admin OR the designated project manager
    if (
      req.user.role === 'manager' &&
      project.manager.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        error: 'Managers can only modify projects they manage.',
      });
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('manager', 'name email avatar role title')
      .populate('members', 'name email avatar role title');

    await ActivityLog.create({
      user: req.user.id,
      action: 'updated_project',
      entityType: 'Project',
      entityId: project._id,
      entityTitle: project.title,
      details: `Project parameters updated`,
    });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin only)
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: `Project not found with id ${req.params.id}`,
      });
    }

    // Delete associated tasks
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    await ActivityLog.create({
      user: req.user.id,
      action: 'deleted_project',
      entityType: 'Project',
      entityId: project._id,
      entityTitle: project.title,
      details: `Project and associated tasks permanently deleted`,
    });

    res.status(200).json({
      success: true,
      data: {},
      message: 'Project and all associated tasks removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
