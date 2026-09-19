import User from '../models/User.js';
import Task from '../models/Task.js';

// @desc    Get all users (with active task counts)
// @route   GET /api/users
// @access  Private
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    // Populate active task workload count for each user
    const usersWithWorkload = await Promise.all(
      users.map(async (user) => {
        const activeTasksCount = await Task.countDocuments({
          assignee: user._id,
          status: { $ne: 'completed' },
        });

        const completedTasksCount = await Task.countDocuments({
          assignee: user._id,
          status: 'completed',
        });

        return {
          ...user.toObject(),
          activeTasksCount,
          completedTasksCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithWorkload.length,
      data: usersWithWorkload,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin only)
export const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;

    if (!['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role provided. Role must be admin, manager, or member.',
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: `User not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
