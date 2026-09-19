import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    key: {
      type: String,
      required: [true, 'Project key identifier is required'],
      trim: true,
      uppercase: true,
      maxlength: [10, 'Key cannot exceed 10 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a project description'],
      maxlength: [1500, 'Description cannot exceed 1500 characters'],
    },
    category: {
      type: String,
      enum: ['Engineering', 'Design', 'Marketing', 'DevOps', 'Security', 'Operations'],
      default: 'Engineering',
    },
    status: {
      type: String,
      enum: ['planning', 'in_progress', 'on_hold', 'completed'],
      default: 'in_progress',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A project manager must be assigned'],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a project target due date'],
    },
    budget: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    color: {
      type: String,
      default: '#6366F1', // Indigo accent
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for populated tasks count
ProjectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  justOne: false,
});

export default mongoose.model('Project', ProjectSchema);
