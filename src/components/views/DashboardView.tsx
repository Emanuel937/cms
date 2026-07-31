import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, FileText, Tags, TrendingUp, CheckCircle, Clock, 
  ArrowRight, Plus, Sparkles, BookOpen, Layers, Award, Activity
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

export const DashboardView: React.FC<{
  onOpenCreateContent: () => void;
  onOpenCreateUser: () => void;
  onOpenCreateTag: () => void;
}> = ({ onOpenCreateContent, onOpenCreateUser, onOpenCreateTag }) => {
  const navigate = useNavigate();
  const { 
    users, tags, content, userProgress, 
    getEnrichedContent, getEnrichedUserProgress,
    fetchUsers, fetchTags, fetchContent, fetchUserProgress
  } = useCMS();

  useEffect(() => {
    fetchUsers();
    fetchTags();
    fetchContent();
    fetchUserProgress();
  }, []);

  const enrichedContents = getEnrichedContent();
  const enrichedProgress = getEnrichedUserProgress();

  const totalUsers = users.length;
  const totalContent = content.length;
  const totalTags = tags.length;
  
  const completedProgress = userProgress.filter((p) => p.completed).length;
  const avgScore = userProgress.length > 0 
    ? Math.round(userProgress.reduce((sum, p) => sum + p.score, 0) / userProgress.length) 
    : 0;

  // Content type counts
  const contentTypes = ['article', 'course', 'lesson', 'quiz', 'page'] as const;
  const typeCounts = contentTypes.map((type) => ({
    type,
    count: content.filter((c) => c.type === type).length,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1E293B] via-slate-800 to-[#1E293B] p-6 md:p-8 text-white shadow-sm border border-slate-700/60">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>WordPress Schema CMS Admin v2.5</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Headless CMS Overview
          </h1>
          <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
            Manage your Users, Content, Tags, Metadata, Relations, and User Progress with a fast, structured interface inspired by WordPress and Ghost.
          </p>

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={onOpenCreateContent}
              className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              + Create New Content
            </button>
            <button
              onClick={onOpenCreateUser}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-all"
            >
              <Users className="w-4 h-4" />
              Add User
            </button>
            <button
              onClick={onOpenCreateTag}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-all"
            >
              <Tags className="w-4 h-4" />
              Add Tag
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metric Cards (Stats Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div 
          onClick={() => navigate('/users')}
          className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
        >
          <div className="text-sm font-medium text-[#64748B] dark:text-slate-400">Total Users</div>
          <div className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 my-2">
            {totalUsers.toLocaleString()}
          </div>
          <div className="text-xs font-semibold text-[#10B981] flex items-center gap-1">
            ↑ 12.5% <span className="text-[#64748B] dark:text-slate-400 font-normal">from last month</span>
          </div>
        </div>

        {/* Total Content */}
        <div 
          onClick={() => navigate('/content')}
          className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
        >
          <div className="text-sm font-medium text-[#64748B] dark:text-slate-400">Content Items</div>
          <div className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 my-2">
            {totalContent}
          </div>
          <div className="text-xs text-[#64748B] dark:text-slate-400">
            Active across 5 content types
          </div>
        </div>

        {/* Total Tags */}
        <div 
          onClick={() => navigate('/tags')}
          className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
        >
          <div className="text-sm font-medium text-[#64748B] dark:text-slate-400">Total Tags</div>
          <div className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 my-2">
            {totalTags}
          </div>
          <div className="text-xs text-[#64748B] dark:text-slate-400">
            Across 4 taxonomy types
          </div>
        </div>

        {/* Avg Progress Score */}
        <div 
          onClick={() => navigate('/user-progress')}
          className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.05)] hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer group"
        >
          <div className="text-sm font-medium text-[#64748B] dark:text-slate-400">Avg. User Score</div>
          <div className="text-2xl font-bold text-[#1E293B] dark:text-slate-100 my-2">
            {avgScore}%
          </div>
          <div className="text-xs font-semibold text-[#10B981] flex items-center gap-1">
            ↑ 3.1% <span className="text-[#64748B] dark:text-slate-400 font-normal">({completedProgress} completed)</span>
          </div>
        </div>
      </div>

      {/* Content Breakdown & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Content Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
            <span className="font-semibold text-base text-[#1E293B] dark:text-slate-100">
              Recent Content
            </span>
            <button
              onClick={onOpenCreateContent}
              className="bg-[#3B82F6] hover:bg-blue-600 text-white px-3.5 py-1.5 rounded-md font-semibold text-xs shadow-sm transition-all"
            >
              + Create New
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-slate-800/60 text-[#64748B] text-xs font-semibold uppercase tracking-wider border-b border-[#E2E8F0] dark:border-slate-800">
                  <th className="py-3 px-6">Title</th>
                  <th className="py-3 px-6">Type</th>
                  <th className="py-3 px-6">Created At</th>
                  <th className="py-3 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800 text-sm">
                {enrichedContents.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-[#1E293B] dark:text-slate-100 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DBEAFE] text-[#1E40AF] dark:bg-blue-950 dark:text-blue-300 capitalize">
                        {item.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[#64748B] dark:text-slate-400 text-xs font-mono">
                      {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCFCE7] text-[#166534] dark:bg-emerald-950 dark:text-emerald-300">
                        Published
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Top Tags & Recent Activity */}
        <div className="space-y-6">
          {/* Top Tags Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800">
              <span className="font-semibold text-base text-[#1E293B] dark:text-slate-100">
                Top Tags
              </span>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              {tags.slice(0, 7).map((t, idx) => {
                const count = [21, 15, 12, 9, 8, 5, 4][idx] || 3;
                return (
                  <span
                    key={t.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F1F5F9] text-[#475569] dark:bg-slate-800 dark:text-slate-300"
                  >
                    {t.name}
                    <span className="opacity-50 text-[10px]">{count}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
            <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-base text-[#1E293B] dark:text-slate-100">
                Recent Activity
              </span>
              <button
                onClick={() => navigate('/user-progress')}
                className="text-xs text-[#3B82F6] font-semibold hover:underline"
              >
                View Log
              </button>
            </div>
            <div className="p-5 divide-y divide-[#E2E8F0] dark:divide-slate-800 text-xs text-[#64748B] dark:text-slate-400">
              {enrichedProgress.slice(0, 3).map((prog) => (
                <div key={prog.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div>
                    <strong className="text-[#1E293B] dark:text-slate-200 font-semibold">{prog.user_email}</strong>{' '}
                    <span>{prog.completed ? 'completed' : 'started'}</span>{' '}
                    <em className="font-medium text-slate-800 dark:text-slate-300 not-italic">"{prog.content_title}"</em>
                  </div>
                  <span className={`font-semibold shrink-0 ml-2 ${prog.completed ? 'text-[#10B981]' : 'text-slate-400'}`}>
                    {prog.completed ? `+${prog.score} pts` : `${prog.score}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
