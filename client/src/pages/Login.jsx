import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Layers,
  ShieldCheck,
  UserCheck,
  Users,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
} from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickDemoLogin, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMessage(res.error);
    }
  };

  const handleQuickLogin = async (role) => {
    setLoading(true);
    setErrorMessage('');
    const res = await quickDemoLogin(role);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-canvas flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 shadow-glow mb-4 text-white">
            <Layers className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            PULSE WORKSPACE
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Enterprise Role-Based Project & Task Management
          </p>
        </div>

        {/* Card */}
        <div className="ui-card p-6 sm:p-8 border border-slate-800 shadow-2xl">
          {/* Expired / Error alerts */}
          {isExpired && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Your session expired. Please log in again to continue.</span>
            </div>
          )}

          {(errorMessage || authError) && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage || authError}</span>
            </div>
          )}

          {/* Quick 1-Click Demo Login Header */}
          <div className="mb-6 p-3.5 bg-slate-900/90 rounded-xl border border-slate-700/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Instant Demo Role Access
              </span>
              <span className="text-[10px] text-slate-500">1-Click Sign In</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <ShieldCheck className="w-4 h-4 mb-1 text-purple-400" />
                <span className="text-[11px] font-bold">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <UserCheck className="w-4 h-4 mb-1 text-amber-400" />
                <span className="text-[11px] font-bold">Manager</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('member')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Users className="w-4 h-4 mb-1 text-emerald-400" />
                <span className="text-[11px] font-bold">Member</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] text-slate-500 uppercase tracking-wider">
              Or Sign In With Email
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-9"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-2.5 text-sm font-semibold mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In to Pulse <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-brand-400 hover:text-brand-300 font-semibold hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
