import React, { useState } from 'react';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

export const LoginView: React.FC = () => {
  const { login, users } = useCMS();
  const [email, setEmail] = useState('admin@cms-studio.io');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setIsLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      setIsLoading(false);
      if (!success) {
        setErrorMsg('Invalid email or password combination.');
      }
    }, 400);
  };

  const quickLoginAs = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('demo123');
    setIsLoading(true);
    setTimeout(() => {
      login(userEmail, 'demo123');
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F0F0F1] dark:bg-[#0F172A] flex flex-col items-center justify-center p-4 transition-colors font-sans text-slate-800 dark:text-slate-200">
      <div className="w-full max-w-sm space-y-6">
        
        {/* WordPress / CMS Admin Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1D2327] dark:bg-slate-800 text-white shadow-xl border-2 border-white/20 transform hover:scale-105 transition-all cursor-pointer">
            <span className="font-black text-2xl tracking-tighter text-[#3858E9] dark:text-blue-400">WP</span>
          </div>
          <h1 className="text-xl font-bold text-[#1D2327] dark:text-slate-100 tracking-tight">
            WordPress CMS Admin
          </h1>
          <p className="text-xs text-[#646970] dark:text-slate-400">
            Log in to manage database schema, posts & user entities
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-700 text-xs rounded-r-md font-medium shadow-sm flex items-center gap-2">
            <span>⚠️ {errorMsg}</span>
          </div>
        )}

        {/* WordPress Form Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#DCDCDE] dark:border-slate-800 p-6 md:p-8 rounded-xl shadow-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#1D2327] dark:text-slate-200 mb-1">
                Username or Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cms-studio.io"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-[#8C8F94] dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2271B1] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-[#1D2327] dark:text-slate-200">
                  Password
                </label>
                <span className="text-[10px] text-[#2271B1] hover:underline cursor-pointer">
                  Lost password?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-[#8C8F94] dark:border-slate-700 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2271B1] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#2271B1] rounded border-slate-300 focus:ring-[#2271B1]"
                />
                <span className="font-medium text-xs text-[#2C3338] dark:text-slate-300">Remember Me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#2271B1] hover:bg-[#135E96] active:bg-[#0A4B78] text-white font-bold text-xs rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Log In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Presets */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>One-Click Demo Accounts</span>
            </div>

            <div className="grid grid-cols-1 gap-1.5 text-xs">
              {users.slice(0, 3).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => quickLoginAs(u.email)}
                  className="flex items-center justify-between px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-left transition-all group"
                >
                  <div className="truncate pr-2">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate text-[11px]">
                      {u.email}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#2271B1] dark:text-blue-400 font-bold group-hover:underline shrink-0">
                    Log in →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-[#646970] dark:text-slate-500 space-y-1">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured Headless WordPress Admin Session</span>
          </p>
          <p className="text-[11px] opacity-75">
            Powered by PostgreSQL & React 19 Engine
          </p>
        </div>

      </div>
    </div>
  );
};
