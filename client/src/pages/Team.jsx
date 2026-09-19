import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  ShieldCheck,
  UserCheck,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  Search,
  Sparkles,
} from 'lucide-react';

export const Team = () => {
  const { user: currentUser, hasRole } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setTeamMembers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load team directory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setTeamMembers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Failed to update role', err);
      alert(err.response?.data?.error || 'Failed to update user role');
    } finally {
      setUpdatingId(null);
    }
  };

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

  const filteredMembers = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.department?.toLowerCase().includes(search.toLowerCase()) ||
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-400" />
            Engineering & Team Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of cross-functional team members, active capacity allocations, and security privileges.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, title, department..."
            className="input-field pl-8 text-xs"
          />
        </div>
      </div>

      {/* Admin Notice */}
      {hasRole('admin') && (
        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div>
            <span className="font-bold text-white">Administrator Access Active:</span> You possess authorization to reassign security roles (Admin, Manager, Member) across all workspace personnel.
          </div>
        </div>
      )}

      {/* Team Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="ui-card p-12 text-center text-slate-500 border border-dashed border-slate-800">
          <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-300">No personnel found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((member) => {
            const isSelf = member._id === currentUser?._id;

            return (
              <div
                key={member._id}
                className="ui-card p-5 border border-slate-800/90 flex flex-col justify-between hover:border-slate-700/80 transition-all hover:scale-[1.01]"
              >
                <div>
                  {/* Top Bar: Avatar & Role */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={
                            member.avatar ||
                            `https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`
                          }
                          alt={member.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-dark-surface ${
                            member.status === 'active'
                              ? 'bg-emerald-500'
                              : member.status === 'away'
                              ? 'bg-amber-500'
                              : 'bg-slate-600'
                          }`}
                        ></span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {member.name}
                          {isSelf && (
                            <span className="text-[10px] text-slate-500 font-normal">(You)</span>
                          )}
                        </h3>
                        <p className="text-xs text-slate-400">{member.title}</p>
                      </div>
                    </div>

                    {/* Role badge */}
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getRoleBadgeStyle(
                        member.role
                      )}`}
                    >
                      {member.role}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-slate-400 mb-4 pb-4 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{member.department || 'Engineering'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  {/* Workload Indicator */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800 mb-4 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-400" />
                      <div>
                        <div className="font-bold text-white">{member.activeTasksCount || 0}</div>
                        <div className="text-[10px] text-slate-500">Active Tasks</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <div>
                        <div className="font-bold text-white">{member.completedTasksCount || 0}</div>
                        <div className="text-[10px] text-slate-500">Completed</div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Role Elevation Control */}
                  {hasRole('admin') && (
                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-400 text-[11px]">Security Role:</span>
                      <select
                        disabled={updatingId === member._id}
                        value={member.role}
                        onChange={(e) => handleRoleChange(member._id, e.target.value)}
                        className="select-field text-xs py-1 px-2 w-32 font-semibold capitalize"
                      >
                        <option value="member">Member</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Team;
