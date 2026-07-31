import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Plus, Trash2, Search, Filter, 
  CheckCircle2, Clock, Award, Users, BookOpen
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { UserProgress } from '../../types/cms';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';

export const UserProgressManagerView: React.FC = () => {
  const { 
    userProgress, users, content, saveUserProgress, deleteUserProgress, 
    getEnrichedUserProgress, searchQuery,
    fetchUserProgress, fetchUsers, fetchContent
  } = useCMS();

  useEffect(() => {
    fetchUserProgress();
    fetchUsers();
    fetchContent();
  }, []);

  const enrichedProgs = getEnrichedUserProgress();

  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [selectedContentId, setSelectedContentId] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form
  const [userId, setUserId] = useState(users[0]?.id || '');
  const [contentId, setContentId] = useState(content[0]?.id || '');
  const [score, setScore] = useState<number>(85);
  const [completed, setCompleted] = useState<boolean>(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredProgs = enrichedProgs.filter((p) => {
    const matchesQuery = p.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUser = selectedUserId === 'all' || p.user_id === selectedUserId;
    const matchesContent = selectedContentId === 'all' || p.content_id === selectedContentId;
    return matchesQuery && matchesUser && matchesContent;
  });

  const paginatedProgs = filteredProgs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !contentId) return;
    saveUserProgress(userId, contentId, score, completed);
    setIsAddOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            UserProgress Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">UserProgress</code> entity records (id, user_id, content_id, score, completed, last_seen)
          </p>
        </div>

        <button
          onClick={() => {
            setUserId(users[0]?.id || '');
            setContentId(content[0]?.id || '');
            setScore(80);
            setCompleted(true);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Log User Progress
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Filter User:</span>
          <select
            value={selectedUserId}
            onChange={(e) => {
              setSelectedUserId(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="all">All Users ({users.length})</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">Filter Content:</span>
          <select
            value={selectedContentId}
            onChange={(e) => {
              setSelectedContentId(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
          >
            <option value="all">All Content Items ({content.length})</option>
            {content.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <th className="pb-3">Progress ID</th>
                <th className="pb-3">User Email</th>
                <th className="pb-3">Content Title</th>
                <th className="pb-3">Score (0-100)</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Last Seen</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedProgs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No progress records found.
                  </td>
                </tr>
              ) : (
                paginatedProgs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {p.id}
                    </td>

                    <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {p.user_email}
                    </td>

                    <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-200 max-w-xs truncate">
                      {p.content_title}
                    </td>

                    {/* Interactive Score Slider */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={p.score}
                          onChange={(e) => {
                            const newScore = parseInt(e.target.value);
                            saveUserProgress(p.user_id, p.content_id, newScore, p.completed);
                          }}
                          className="w-20 accent-blue-600"
                        />
                        <span className="font-black text-slate-900 dark:text-slate-100 font-mono w-8">
                          {p.score}%
                        </span>
                      </div>
                    </td>

                    {/* Interactive Completed Toggle */}
                    <td className="py-3.5">
                      <button
                        onClick={() => {
                          saveUserProgress(p.user_id, p.content_id, p.score, !p.completed);
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                          p.completed
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-200'
                        }`}
                      >
                        {p.completed ? '✓ Completed' : '⌛ In Progress'}
                      </button>
                    </td>

                    <td className="py-3.5 font-mono text-slate-400 text-[11px]">
                      {new Date(p.last_seen).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => deleteUserProgress(p.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete Progress Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredProgs.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* CREATE PROGRESS MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Log New User Progress"
        subtitle="Insert record into UserProgress schema table"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select User
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.email} ({u.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Content Item
            </label>
            <select
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {content.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Score (0 - 100)
              </label>
              <span className="font-black text-blue-600 dark:text-blue-400 font-mono text-sm">{score}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="completedCheck"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
            />
            <label htmlFor="completedCheck" className="font-bold text-slate-800 dark:text-slate-200">
              Mark as Completed
            </label>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
            >
              Save Progress
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
