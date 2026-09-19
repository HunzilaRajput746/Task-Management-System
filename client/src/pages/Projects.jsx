import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  LayoutGrid,
  List as ListIcon,
  Settings,
} from 'lucide-react';
import { format } from 'date-fns';

export const Projects = ({ onOpenNewProject, onEditProject }) => {
  const { hasRole } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.get('/projects', {
        params: {
          search: search || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        },
      });
      if (res.data.success) {
        setProjects(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter, categoryFilter, priorityFilter]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'in_progress':
        return 'bg-brand-500/10 text-brand-400 border-brand-500/30';
      case 'planning':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
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

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-brand-400" />
            Projects Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse and coordinate organizational initiatives, roadmap milestones, and deliverables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {hasRole('admin', 'manager') && (
            <button
              onClick={onOpenNewProject}
              className="btn-primary text-xs py-2 px-3.5 shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="ui-card p-4 border border-slate-800/90 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, key, keyword..."
            className="input-field pl-9 text-xs"
          />
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select-field text-xs py-2"
          >
            <option value="all">All Categories</option>
            <option value="Engineering">Engineering</option>
            <option value="Design">Design</option>
            <option value="DevOps">DevOps</option>
            <option value="Security">Security</option>
            <option value="Operations">Operations</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field text-xs py-2"
          >
            <option value="all">All Statuses</option>
            <option value="in_progress">In Progress</option>
            <option value="planning">Planning</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
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

      {/* Projects Display */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="ui-card p-12 text-center text-slate-500 border border-dashed border-slate-800">
          <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No projects found</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing your filters or create a new project.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => {
            const progress = proj.metrics?.progressPercent || 0;
            const total = proj.metrics?.totalTasks || 0;
            const completed = proj.metrics?.completedTasks || 0;

            return (
              <div
                key={proj._id}
                className="ui-card p-5 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700/90 transition-all duration-200 hover:scale-[1.01]"
              >
                <div>
                  {/* Top Bar: Key & Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                      {proj.key}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                          proj.status
                        )}`}
                      >
                        {proj.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(
                          proj.priority
                        )}`}
                      >
                        {proj.priority}
                      </span>
                      {hasRole('admin', 'manager') && (
                        <button
                          onClick={() => onEditProject(proj)}
                          className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                          title="Edit Project"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <Link
                    to={`/projects/${proj._id}`}
                    className="block group"
                  >
                    <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors mb-2 line-clamp-1">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {proj.description}
                    </p>
                  </Link>
                </div>

                <div>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Velocity</span>
                      <span className="font-extrabold text-white">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-brand-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>{completed} of {total} tasks closed</span>
                      <span>Due: {format(new Date(proj.dueDate), 'MMM d, yyyy')}</span>
                    </div>
                  </div>

                  {/* Card Footer: Manager & Members */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          proj.manager?.avatar ||
                          `https://api.dicebear.com/7.x/initials/svg?seed=${proj.manager?.name}`
                        }
                        alt={proj.manager?.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-700"
                        title={`Manager: ${proj.manager?.name}`}
                      />
                      <span className="text-[11px] text-slate-400">{proj.manager?.name}</span>
                    </div>

                    {/* Member Stack */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {proj.members?.slice(0, 4).map((m, idx) => (
                        <img
                          key={idx}
                          src={
                            m.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${m.name}`
                          }
                          alt={m.name}
                          className="inline-block h-5 w-5 rounded-full ring-2 ring-dark-surface object-cover"
                          title={m.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="ui-card overflow-hidden border border-slate-800/90">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/60 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Key & Title</th>
                <th className="p-3 font-semibold">Category</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">Manager</th>
                <th className="p-3 font-semibold">Progress</th>
                <th className="p-3 font-semibold text-right">Target Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {projects.map((proj) => (
                <tr key={proj._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3">
                    <Link
                      to={`/projects/${proj._id}`}
                      className="font-bold text-white hover:text-brand-300 flex items-center gap-2"
                    >
                      <span className="font-mono text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20 text-[11px]">
                        {proj.key}
                      </span>
                      <span>{proj.title}</span>
                    </Link>
                  </td>
                  <td className="p-3 text-slate-400">{proj.category}</td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusBadge(
                        proj.status
                      )}`}
                    >
                      {proj.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityBadge(
                        proj.priority
                      )}`}
                    >
                      {proj.priority}
                    </span>
                  </td>
                  <td className="p-3">{proj.manager?.name}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-brand-500 h-1.5 rounded-full"
                          style={{ width: `${proj.metrics?.progressPercent || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[11px] font-bold">{proj.metrics?.progressPercent || 0}%</span>
                    </div>
                  </td>
                  <td className="p-3 text-right text-slate-400 font-mono">
                    {format(new Date(proj.dueDate), 'yyyy-MM-dd')}
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

export default Projects;
