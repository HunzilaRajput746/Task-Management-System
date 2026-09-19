import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  FolderGit2,
  CheckSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import { format } from 'date-fns';

export const Dashboard = ({ onOpenNewProject, onOpenNewTask }) => {
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        if (activityRes.data.success) {
          setActivities(activityRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold">Aggregating workspace telemetry...</span>
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const statusData = stats?.statusBreakdown || [];
  const priorityData = stats?.priorityBreakdown || [];
  const projects = stats?.projectProgressList || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-dark-surface to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">
              Workspace Overview
            </span>
            <span className="text-xs text-slate-400">• Current Role: <b className="uppercase text-slate-200">{user?.role}</b></span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here is the real-time operational status and progress breakdown across your engineering squads.
          </p>
        </div>

        {hasRole('admin', 'manager') && (
          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={onOpenNewTask}
              className="btn-primary text-xs py-2 px-3.5 shadow-glow"
            >
              + Create Task
            </button>
            <button
              onClick={onOpenNewProject}
              className="btn-secondary text-xs py-2 px-3.5"
            >
              + New Project
            </button>
          </div>
        )}
      </div>

      {/* KPI Summary Cards (8pt rhythm) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Projects */}
        <div className="ui-card p-5 border border-slate-800/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Projects</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{metrics.totalProjects || 0}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {metrics.activeProjects || 0} active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Across engineering & security roadmaps
          </div>
        </div>

        {/* Card 2: Tasks In-Flight */}
        <div className="ui-card p-5 border border-slate-800/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">In-Flight Tasks</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{metrics.inProgressTasks || 0}</span>
            <span className="text-xs text-slate-400 font-medium">
              of {metrics.totalTasks || 0} total
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {metrics.todoTasks || 0} pending in backlog / to do
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="ui-card p-5 border border-slate-800/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Completion Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">
              {metrics.completionRate || 0}%
            </span>
            <span className="text-xs text-slate-400">
              ({metrics.completedTasks || 0} resolved)
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${metrics.completionRate || 0}%` }}
            ></div>
          </div>
        </div>

        {/* Card 4: Overdue Attention */}
        <div className="ui-card p-5 border border-slate-800/90">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Attention Needed</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-rose-400">
              {metrics.overdueTasks || 0}
            </span>
            <span className="text-xs text-slate-400">overdue tasks</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Past target delivery SLA
          </div>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Donut Chart */}
        <div className="ui-card p-5 border border-slate-800/90 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Status Breakdown</h3>
              <p className="text-xs text-slate-400 mt-0.5">Task distribution across development lifecycle</p>
            </div>
            <span className="text-xs font-bold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-md border border-brand-500/20">
              {metrics.totalTasks} Tasks
            </span>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Legend */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 pt-4 border-t border-slate-800/80">
            {statusData.map((s, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  ></div>
                  <span className="text-[11px] text-slate-400">{s.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution Bar Chart */}
        <div className="ui-card p-5 border border-slate-800/90 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Priority Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Task criticality and risk weighting</p>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
              Severity Analysis
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#fff',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Priority breakdown legend */}
          <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800/80">
            {priorityData.map((p, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1.5 mb-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  ></div>
                  <span className="text-[11px] text-slate-400">{p.name}</span>
                </div>
                <span className="text-xs font-bold text-white">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Progress & Recent Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Progress Trackers */}
        <div className="lg:col-span-2 ui-card p-5 border border-slate-800/90">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Active Projects Progress</h3>
              <p className="text-xs text-slate-400 mt-0.5">Execution velocity against committed roadmaps</p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {projects.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">
                No active projects found.
              </div>
            ) : (
              projects.map((p) => (
                <Link
                  key={p._id}
                  to={`/projects/${p._id}`}
                  className="block p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800/80 hover:border-slate-700 transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                        {p.key}
                      </span>
                      <span className="text-xs font-bold text-white">{p.title}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-200">
                      {p.progress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-400 transition-all duration-500"
                      style={{ width: `${p.progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>Manager: <b className="text-slate-300">{p.manager?.name || 'Unassigned'}</b></span>
                    </div>
                    <span>
                      {p.completedTasks} / {p.totalTasks} Tasks Completed
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="ui-card p-5 border border-slate-800/90 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-brand-400" />
                Live Audit Stream
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Chronological team activity log</p>
            </div>
          </div>

          <div className="space-y-3.5 overflow-y-auto max-h-96 pr-1">
            {activities.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">
                No recent activity recorded.
              </div>
            ) : (
              activities.map((act) => (
                <div key={act._id} className="flex gap-2.5 text-xs">
                  <img
                    src={
                      act.user?.avatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${act.user?.name}`
                    }
                    alt={act.user?.name}
                    className="w-6 h-6 rounded-full object-cover mt-0.5"
                  />
                  <div className="flex-1">
                    <div className="text-slate-200 leading-snug">
                      <span className="font-semibold text-white">{act.user?.name}</span>{' '}
                      <span className="text-slate-400">{act.details}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {act.createdAt ? format(new Date(act.createdAt), 'MMM d, h:mm a') : 'Recently'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
