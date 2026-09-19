import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const ProjectModal = ({
  isOpen,
  onClose,
  project,
  users = [],
  onProjectSaved,
  onProjectDeleted,
}) => {
  const { user, hasRole } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    key: '',
    description: '',
    category: 'Engineering',
    status: 'in_progress',
    priority: 'medium',
    manager: '',
    members: [],
    dueDate: '',
    budget: 50000,
    color: '#6366F1',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        key: project.key || '',
        description: project.description || '',
        category: project.category || 'Engineering',
        status: project.status || 'in_progress',
        priority: project.priority || 'medium',
        manager: project.manager?._id || project.manager || '',
        members: project.members ? project.members.map((m) => m._id || m) : [],
        dueDate: project.dueDate ? format(new Date(project.dueDate), 'yyyy-MM-dd') : '',
        budget: project.budget || 50000,
        color: project.color || '#6366F1',
      });
    } else {
      setFormData({
        title: '',
        key: '',
        description: '',
        category: 'Engineering',
        status: 'in_progress',
        priority: 'medium',
        manager: user?._id || '',
        members: user?._id ? [user._id] : [],
        dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        budget: 75000,
        color: '#6366F1',
      });
    }
  }, [project, user, isOpen]);

  const toggleMember = (memberId) => {
    if (formData.members.includes(memberId)) {
      setFormData({
        ...formData,
        members: formData.members.filter((id) => id !== memberId),
      });
    } else {
      setFormData({
        ...formData,
        members: [...formData.members, memberId],
      });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (project?._id) {
        const res = await api.put(`/projects/${project._id}`, formData);
        onProjectSaved(res.data.data);
      } else {
        const res = await api.post('/projects', formData);
        onProjectSaved(res.data.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save project.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Deleting this project will permanently remove all tasks within it. Are you sure?')) {
      return;
    }
    try {
      await api.delete(`/projects/${project._id}`);
      onProjectDeleted(project._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete project.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={project ? 'Edit Project Settings' : 'Create New Project'}
      subtitle="Define objectives, project scope and allocate cross-functional team members"
      maxWidth="max-w-2xl"
    >
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4">
        {/* Title & Key */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Cloud Infrastructure Migration"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Key Identifier
            </label>
            <input
              type="text"
              required
              maxLength={6}
              disabled={!!project}
              value={formData.key}
              onChange={(e) => setFormData({ ...formData, key: e.target.value.toUpperCase() })}
              placeholder="e.g. INFRA"
              className="input-field uppercase font-mono"
            />
          </div>
        </div>

        {/* Category, Status, Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="select-field"
            >
              <option value="Engineering">Engineering</option>
              <option value="Design">Design</option>
              <option value="DevOps">DevOps</option>
              <option value="Security">Security</option>
              <option value="Marketing">Marketing</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="select-field"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Priority
            </label>
            <select
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
        </div>

        {/* Manager & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Designated Project Manager
            </label>
            <select
              required
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="select-field"
            >
              <option value="">Select Manager</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Project Description & Objectives
          </label>
          <textarea
            rows="3"
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief strategic goals, business outcomes, technical scope..."
            className="input-field resize-none"
          />
        </div>

        {/* Assign Team Members Multiselect */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">
            Team Members ({formData.members.length} selected)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-900/50 rounded-lg border border-slate-800">
            {users.map((u) => {
              const isSelected = formData.members.includes(u._id);
              return (
                <div
                  key={u._id}
                  onClick={() => toggleMember(u._id)}
                  className={`flex items-center gap-2 p-1.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-brand-500/20 border-brand-500 text-brand-200'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={
                      u.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`
                    }
                    alt={u.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="truncate">{u.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {project && hasRole('admin') ? (
            <button
              type="button"
              onClick={handleDelete}
              className="btn-danger text-xs px-3 py-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Project</span>
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
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs px-4 py-2"
            >
              {loading ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;
