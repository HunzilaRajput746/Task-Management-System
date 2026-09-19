import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'created_project',
        'updated_project',
        'deleted_project',
        'created_task',
        'updated_task',
        'status_changed',
        'added_comment',
        'completed_task',
        'updated_checklist',
      ],
    },
    entityType: {
      type: String,
      enum: ['Project', 'Task', 'User'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    entityTitle: {
      type: String,
      default: '',
    },
    details: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('ActivityLog', ActivityLogSchema);
