import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Trash2,
  CheckSquare,
  Square,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export const TaskModal = ({
  isOpen,
  onClose,
  task,
  projects = [],
  users = [],
  onTaskUpdated,
  onTaskDeleted,
}) => {
  const { user, hasRole } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    estimatedHours: 4,
  });
  const [checklists, setChecklists] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        project: task.project?._id || task.project || '',
        assignee: task.assignee?._id || task.assignee || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        estimatedHours: task.estimatedHours || 4,
      });
      setChecklists(task.checklists || []);
      setComments(task.comments || []);
    } else {
      setFormData({
        title: '',
        description: '',
        project: projects[0]?._id || '',
        assignee: '',
        status: 'todo',
        priority: 'medium',
        dueDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        estimatedHours: 4,
      });
      setChecklists([]);
      setComments([]);
    }
  }, [task, projects, isOpen]);

  const canEdit =
    hasRole('admin', 'manager') ||
    (task && task.assignee?._id === user?._id) ||
    !task;

  const canDelete = task && hasRole('admin', 'manager');

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (task?._id) {
        // Update existing task
        const res = await api.put(`/tasks/${task._id}`, {
          ...formData,
          checklists,
        });
        onTaskUpdated(res.data.data);
      } else {
        // Create new task
        const res = await api.post('/tasks', {
          ...formData,
          checklists,
        });
        onTaskUpdated(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save task.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setFormData((prev) => ({ ...prev, status: newStatus }));
    if (task?._id) {
      try {
        const res = await api.patch(`/tasks/${task._id}/status`, {
          status: newStatus,
        });
        onTaskUpdated(res.data.data);
      } catch (err) {
        console.error('Failed to update status', err);
      }
    }
  };

  const toggleChecklist = async (index) => {
    const updated = [...checklists];
    updated[index].completed = !updated[index].completed;
    setChecklists(updated);

    if (task?._id) {
      try {
        await api.put(`/tasks/${task._id}/checklist`, { checklists: updated });
      } catch (err) {
        console.error('Failed to update checklist', err);
      }
    }
  };

  const addChecklistItem = async () => {
    if (!newChecklistText.trim()) return;
    const updated = [...checklists, { title: newChecklistText.trim(), completed: false }];
    setChecklists(updated);
    setNewChecklistText('');

    if (task?._id) {
      try {
        await api.put(`/tasks/${task._id}/checklist`, { checklists: updated });
      } catch (err) {
        console.error('Failed to add checklist item', err);
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !task?._id) return;
    try {
      const res = await api.post(`/tasks/${task._id}/comments`, {
        text: newCommentText.trim(),
      });
      setComments(res.data.data.comments || []);
      setNewCommentText('');
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onTaskDeleted(task._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? `${task.taskCode || 'Task'} Details` : 'Create New Task'}
      subtitle={task?.project?.title || 'Assign to project and set priority'}
      maxWidth="max-w-3xl"
    >
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Task Title
          </label>
          <input
            type="text"
            required
            disabled={!canEdit}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Implement mTLS zero-trust network policies"
            className="input-field text-sm"
          />
        </div>

        {/* Project & Assignee Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project
            </label>
            <select
              required
              disabled={!hasRole('admin', 'manager')}
              value={formData.project}
              onChange={(e) => setFormData({ ...formData, project: e.target.value })}
              className="select-field"
            >
              <option value="">Select Project</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.key} - {proj.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Assignee
            </label>
            <select
              disabled={!hasRole('admin', 'manager')}
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="select-field"
            >
              <option value="">Unassigned</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status, Priority, Due Date Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="select-field"
            >
              <option value="backlog">Backlog</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="in_review">In Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Priority
            </label>
            <select
              disabled={!canEdit}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="select-field"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Due Date
            </label>
            <input
              type="date"
              required
              disabled={!canEdit}
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows="3"
            disabled={!canEdit}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed requirements, technical acceptance criteria..."
            className="input-field resize-none"
          />
        </div>

        {/* Acceptance Checklist */}
        <div className="pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Acceptance Criteria & Checklists ({checklists.filter((c) => c.completed).length}/
            {checklists.length})
          </label>

          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {checklists.map((item, idx) => (
              <div
                key={idx}
                onClick={() => toggleChecklist(idx)}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
              >
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                <span
                  className={`text-xs ${
                    item.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {item.title}
                </span>
              </div>
            ))}
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
                placeholder="Add sub-task or acceptance criteria item..."
                className="input-field text-xs py-1.5"
              />
              <button
                type="button"
                onClick={addChecklistItem}
                className="btn-secondary px-3 py-1.5 text-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          )}
        </div>

        {/* Discussion / Comments Section (Only for existing tasks) */}
        {task && (
          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Discussion & Activity ({comments.length})
            </label>

            <div className="space-y-3 mb-3 max-h-48 overflow-y-auto pr-1">
              {comments.length === 0 ? (
                <div className="text-xs text-slate-500 italic py-2">
                  No comments yet. Start the conversation below.
                </div>
              ) : (
                comments.map((c, idx) => (
                  <div key={idx} className="flex gap-2.5 text-xs">
                    <img
                      src={
                        c.user?.avatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${c.user?.name}`
                      }
                      alt={c.user?.name}
                      className="w-6 h-6 rounded-full object-cover mt-0.5"
                    />
                    <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-semibold text-slate-200">{c.user?.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {c.createdAt ? format(new Date(c.createdAt), 'MMM d, h:mm a') : 'Just now'}
                        </span>
                      </div>
                      <p className="text-slate-300 text-xs leading-relaxed">{c.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add comment input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddComment(e);
                  }
                }}
                placeholder="Write a comment..."
                className="input-field text-xs py-2"
              />
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!newCommentText.trim()}
                className="btn-primary px-3 py-2 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Actions Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {canDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="btn-danger text-xs px-3 py-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Task</span>
            </button>
          ) : (
            <div></div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              Cancel
            </button>
            {canEdit && (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary text-xs px-4 py-2"
              >
                {loading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
