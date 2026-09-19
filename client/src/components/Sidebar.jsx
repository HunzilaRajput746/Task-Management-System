import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
  Plus,
  FolderPlus,
  Server,
} from 'lucide-react';

export const Sidebar = ({ onOpenNewProject, onOpenNewTask }) => {
  const { hasRole } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: Briefcase },
    { name: 'Tasks Hub', path: '/tasks', icon: CheckSquare },
    { name: 'Team Directory', path: '/team', icon: Users },
  ];

  const canManage = hasRole('admin', 'manager');

  return (
    <aside className="w-64 bg-dark-surface/60 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Action Buttons for Admins & Managers */}
        {canManage && (
          <div className="space-y-2">
            <button
              onClick={onOpenNewTask}
              className="w-full btn-primary py-2.5 text-xs font-semibold shadow-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Task</span>
            </button>
            <button
              onClick={onOpenNewProject}
              className="w-full btn-secondary py-2 text-xs font-semibold"
            >
              <FolderPlus className="w-3.5 h-3.5 text-brand-400" />
              <span>New Project</span>
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600/15 text-brand-400 font-semibold border border-brand-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Banner */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white text-[11px]">System Status: Operational</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Server className="w-3 h-3" />
            <span>MERN Stack • RBAC Guard Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
