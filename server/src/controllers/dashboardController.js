import Project from '../models/Project.js';
import Task from '../models/Task.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';

// @desc    Get system-wide or role-contextual dashboard analytics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({
      status: 'in_progress',
    });
    const completedProjects = await Project.countDocuments({
      status: 'completed',
    });

    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const inProgressTasks = await Task.countDocuments({
      status: { $in: ['in_progress', 'in_review'] },
    });
    const todoTasks = await Task.countDocuments({
      status: { $in: ['backlog', 'todo'] },
    });

    // Overdue tasks: dueDate < now and status != completed
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    });

    // Status breakdown for charts
    const statusBreakdown = [
      { name: 'Backlog', count: await Task.countDocuments({ status: 'backlog' }), color: '#64748B' },
      { name: 'To Do', count: await Task.countDocuments({ status: 'todo' }), color: '#38BDF8' },
      { name: 'In Progress', count: await Task.countDocuments({ status: 'in_progress' }), color: '#6366F1' },
      { name: 'In Review', count: await Task.countDocuments({ status: 'in_review' }), color: '#F59E0B' },
      { name: 'Completed', count: completedTasks, color: '#10B981' },
    ];

    // Priority breakdown
    const priorityBreakdown = [
      { name: 'Low', count: await Task.countDocuments({ priority: 'low' }), color: '#94A3B8' },
      { name: 'Medium', count: await Task.countDocuments({ priority: 'medium' }), color: '#3B82F6' },
      { name: 'High', count: await Task.countDocuments({ priority: 'high' }), color: '#F97316' },
      { name: 'Urgent', count: await Task.countDocuments({ priority: 'urgent' }), color: '#EF4444' },
    ];

    // Top active projects with task progress
    const rawProjects = await Project.find()
      .select('title key status priority dueDate members manager')
      .populate('manager', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(6);

    const projectProgressList = await Promise.all(
      rawProjects.map(async (p) => {
        const pTotal = await Task.countDocuments({ project: p._id });
        const pDone = await Task.countDocuments({
          project: p._id,
          status: 'completed',
        });
        const percent = pTotal > 0 ? Math.round((pDone / pTotal) * 100) : 0;
        return {
          _id: p._id,
          title: p.title,
          key: p.key,
          status: p.status,
          manager: p.manager,
          totalTasks: pTotal,
          completedTasks: pDone,
          progress: percent,
        };
      })
    );

    // Current user specific counts
    const myAssignedTasks = await Task.countDocuments({
      assignee: req.user.id,
      status: { $ne: 'completed' },
    });
    const myCompletedTasks = await Task.countDocuments({
      assignee: req.user.id,
      status: 'completed',
    });

    const completionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          todoTasks,
          overdueTasks,
          completionRate,
          myAssignedTasks,
          myCompletedTasks,
        },
        statusBreakdown,
        priorityBreakdown,
        projectProgressList,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity stream across projects and tasks
// @route   GET /api/dashboard/activity
// @access  Private
export const getRecentActivity = async (req, res, next) => {
  try {
    const activities = await ActivityLog.find()
      .populate('user', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};
