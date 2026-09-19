import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import KanbanBoard from '../components/KanbanBoard';
import {
  Briefcase,
  Calendar,
  DollarSign,
  Users,
  Plus,
  ArrowLeft,
  Kanban,
  List as ListIcon,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';

export const ProjectDetail = ({ onOpenNewTask, onTaskClick, onEditProject }) => {
  const { id } = useParams();
  const { hasRole } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'list'
  const [taskSearch, setTaskSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const fetchProjectData = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      if (res.data.success) {
        setProject(res.data.data);
        setTasks(res.data.data.tasks || []);
      }
    } catch (err) {
      console.error('Failed to load project details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProjectData();
    } catch (err) {
      console.error('Failed to patch task status', err);
      fetchProjectData();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="ui-card p-12 text-center text-slate-400">
        <h3 className="text-base font-bold text-white mb-2">Project not found</h3>
        <Link to="/projects" className="btn-secondary text-xs">
          Return to Projects
        </Link>
      </div>
    );
  }

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.taskCode && t.taskCode.toLowerCase().includes(taskSearch.toLowerCase()));
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const progress = project.metrics?.progressPercent || 0;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Projects</span>
        </Link>

        <div className="flex items-center gap-2">
          {hasRole('admin', 'manager') && (
            <>
              <button
                onClick={() => onEditProject(project)}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Project Settings</span>
              </button>
              <button
                onClick={() => onOpenNewTask(project._id)}
                className="btn-primary text-xs py-1.5 px-3 shadow-glow"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Project Hero Banner */}
      <div className="ui-card p-6 border border-slate-800/90 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-xs font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                {project.key}
              </span>
              <span className="text-xs text-slate-400 font-medium px-2 py-0.5 rounded bg-slate-800">
                {project.category}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/30">
                {project.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                {project.priority} priority
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
              {project.title}
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="w-full lg:w-72 p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400">Target Progress</span>
              <span className="font-extrabold text-white">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-3">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
              <span>{completedCount}/{tasks.length} Tasks Closed</span>
              <span>Due {format(new Date(project.dueDate), 'MMM d, yyyy')}</span>
            </div>
          </div>
        </div>

        {/* Hero Meta Bar: Manager & Members */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Project Manager:</span>
            <div className="flex items-center gap-2">
              <img
                src={
                  project.manager?.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${project.manager?.name}`
                }
                alt={project.manager?.name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <span className="font-semibold text-slate-200">{project.manager?.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500">Allocated Team ({project.members?.length || 0}):</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              {project.members?.map((m) => (
                <img
                  key={m._id}
                  src={
                    m.avatar ||
                    `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`
                  }
                  alt={m.name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-dark-surface object-cover"
                  title={`${m.name} (${m.role})`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher & In-Project Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tab switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'kanban'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'list'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListIcon className="w-3.5 h-3.5" />
            <span>Task List ({filteredTasks.length})</span>
          </button>
        </div>

        {/* Task Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              placeholder="Filter tasks..."
              className="input-field text-xs pl-8 py-1.5 w-48 sm:w-60"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="select-field text-xs py-1.5 w-32"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'kanban' ? (
        <KanbanBoard
          tasks={filteredTasks}
          onTaskClick={onTaskClick}
          onStatusChange={handleStatusChange}
        />
      ) : (
        /* List View */
        <div className="ui-card overflow-hidden border border-slate-800/90">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Code & Title</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">Assignee</th>
                <th className="p-3 font-semibold">Checklist</th>
                <th className="p-3 font-semibold text-right">Target Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredTasks.map((t) => (
                <tr
                  key={t._id}
                  onClick={() => onTaskClick(t)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="p-3">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <span className="font-mono text-brand-400 text-[11px] bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">
                        {t.taskCode}
                      </span>
                      <span>{t.title}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {t.priority}
                    </span>
                  </td>
                  <td className="p-3">
                    {t.assignee ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={
                            t.assignee.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${t.assignee.name}`
                          }
                          alt={t.assignee.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{t.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-500 italic">Unassigned</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">
                    {t.checklists?.filter((c) => c.completed).length || 0}/
                    {t.checklists?.length || 0}
                  </td>
                  <td className="p-3 text-right font-mono text-slate-400">
                    {format(new Date(t.dueDate), 'yyyy-MM-dd')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
