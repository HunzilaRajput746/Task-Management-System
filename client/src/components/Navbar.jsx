import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  UserCheck,
  Users,
  LogOut,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';

export const Navbar = ({ onOpenNewTask, onOpenNewProject }) => {
  const { user, logout, quickDemoLogin, hasRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'manager':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'manager':
        return <UserCheck className="w-3.5 h-3.5" />;
      default:
        return <Users className="w-3.5 h-3.5" />;
    }
  };

  const handleRoleSwitch = async (role) => {
    setShowRoleMenu(false);
    await quickDemoLogin(role);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-dark-surface/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between transition-all">
      {/* Brand Mobile view & current context indicator */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-700 flex items-center justify-center text-white shadow-glow">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              PULSE
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
                PRO
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick Role Switcher Dropdown (Reviewer Friendly) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/90 border border-slate-700 text-slate-200 hover:border-slate-600 transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Switch Demo Role"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Test Role:</span>
            <span className="capitalize text-white font-bold">{user?.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-dark-surface border border-slate-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-slide-up">
              <div className="px-3 py-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Instant Role Switching
              </div>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                  user?.role === 'admin' ? 'text-purple-400 font-bold bg-purple-500/10' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold">Administrator</div>
                    <div className="text-[10px] text-slate-400">Full control & user management</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleRoleSwitch('manager')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                  user?.role === 'manager' ? 'text-amber-400 font-bold bg-amber-500/10' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-semibold">Project Manager</div>
                    <div className="text-[10px] text-slate-400">Create & allocate projects/tasks</div>
                  </div>
                </div>
              </button>
              <button
                onClick={() => handleRoleSwitch('member')}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                  user?.role === 'member' ? 'text-emerald-400 font-bold bg-emerald-500/10' : 'text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-semibold">Team Member</div>
                    <div className="text-[10px] text-slate-400">Update status, checklists & comments</div>
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User profile capsule */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-8 h-8 rounded-full ring-2 ring-slate-700/60 object-cover"
          />
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-white leading-tight flex items-center gap-1.5">
              {user?.name}
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${getRoleBadgeStyle(
                  user?.role
                )}`}
              >
                {getRoleIcon(user?.role)}
                {user?.role}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{user?.title}</div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
