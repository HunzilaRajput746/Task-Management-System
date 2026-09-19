import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CheckSquare,
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  MessageSquare,
  Square,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export const Tasks = ({ onOpenNewTask, onTaskClick }) => {
  const { user, hasRole } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get('/tasks', {
          params: {
            search: search || undefined,
            project: selectedProject !== 'all' ? selectedProject : undefined,
            assignee: selectedAssignee !== 'all' ? selectedAssignee : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            priority: selectedPriority !== 'all' ? selectedPriority : undefined,
          },
        }),
        api.get('/projects'),
        api.get('/users'),
      ]);

      if (tasksRes.data.success) setTasks(tasksRes.data.data);
      if (projectsRes.data.success) setProjects(projectsRes.data.data);
      if (usersRes.data.success) setUsers(usersRes.data.data);
    } catch (err) {
      console.error('Failed to fetch tasks hub data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedProject, selectedAssignee, selectedStatus, selectedPriority]);

  const handleQuickStatusChange = async (taskId, newStatus, e) => {
    e.stopPropagation();
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      console.error('Failed to change status', err);
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'high':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'medium':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  const isOverdue = (dueDate, status) => {
    if (status === 'completed') return false;
    const date = new Date(dueDate);
    return isPast(date) && !isToday(date);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-brand-400" />
            Tasks Command Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Universal backlog and task pipeline with real-time assignment tracking.
          </p>
        </div>

        {hasRole('admin', 'manager') && (
          <button
            onClick={() => onOpenNewTask()}
            className="btn-primary text-xs py-2 px-3.5 shadow-glow"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Multi-Filter Toolbar */}
      <div className="ui-card p-4 border border-slate-800/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="input-field pl-8 text-xs"
          />
        </div>

        {/* Filter Project */}
        <div>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="select-field text-xs py-2"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.key} - {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Assignee */}
        <div>
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="select-field text-xs py-2"
          >
            <option value="all">All Assignees</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select-field text-xs py-2"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Filter Priority */}
        <div>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="select-field text-xs py-2"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="ui-card p-12 text-center text-slate-500 border border-dashed border-slate-800">
          <CheckSquare className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No matching tasks</h3>
          <p className="text-xs text-slate-500 mt-1">Adjust search terms or clear active filters.</p>
        </div>
      ) : (
        <div className="ui-card overflow-hidden border border-slate-800/90">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Identifier & Title</th>
                <th className="p-3 font-semibold">Project</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">Assignee</th>
                <th className="p-3 font-semibold">Checklist</th>
                <th className="p-3 font-semibold text-right">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {tasks.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                const completedChecklist = task.checklists?.filter((c) => c.completed).length || 0;
                const totalChecklist = task.checklists?.length || 0;

                return (
                  <tr
                    key={task._id}
                    onClick={() => onTaskClick(task)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    {/* Title */}
                    <td className="p-3">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <span className="font-mono text-brand-400 text-[11px] bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                          {task.taskCode}
                        </span>
                        <span className="hover:text-brand-300 transition-colors">
                          {task.title}
                        </span>
                      </div>
                    </td>

                    {/* Project */}
                    <td className="p-3 text-slate-400 font-medium">
                      {task.project?.title || 'Unknown'}
                    </td>

                    {/* Status Pill with Quick Switch */}
                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={task.status}
                        onChange={(e) => handleQuickStatusChange(task._id, e.target.value, e)}
                        className="text-[11px] bg-slate-900 text-slate-200 border border-slate-700 rounded-md px-2 py-1 font-semibold focus:outline-none focus:border-brand-500"
                      >
                        <option value="backlog">Backlog</option>
                        <option value="todo">To Do</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    </td>

                    {/* Assignee */}
                    <td className="p-3">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              task.assignee.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${task.assignee.name}`
                            }
                            alt={task.assignee.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{task.assignee.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unassigned</span>
                      )}
                    </td>

                    {/* Checklist */}
                    <td className="p-3 text-slate-400">
                      {totalChecklist > 0 ? (
                        <span className="flex items-center gap-1.5">
                          <span
                            className={
                              completedChecklist === totalChecklist
                                ? 'text-emerald-400 font-bold'
                                : 'text-slate-300'
                            }
                          >
                            {completedChecklist}/{totalChecklist}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td
                      className={`p-3 text-right font-mono ${
                        overdue
                          ? 'text-rose-400 font-bold'
                          : task.status === 'completed'
                          ? 'text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {format(new Date(task.dueDate), 'yyyy-MM-dd')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Tasks;
