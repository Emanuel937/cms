import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, Eye, Shield, 
  Key, Calendar, CheckCircle2, TrendingUp, RefreshCw, X 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { User, EnrichedUser } from '../../types/cms';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';

export const UsersManagerView: React.FC<{ isOpenCreateModal?: boolean; onCloseCreateModal?: () => void }> = ({
  isOpenCreateModal,
  onCloseCreateModal,
}) => {
  const { 
    getEnrichedUsers, addUser, updateUser, deleteUser, 
    searchQuery, setSearchQuery, fetchUsers
  } = useCMS();

  useEffect(() => {
    fetchUsers();
  }, []);

  const enrichedUsers = getEnrichedUsers();

  // Local Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [viewProgressUser, setViewProgressUser] = useState<EnrichedUser | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [passwordHash, setPasswordHash] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Search Filter
  const filteredUsers = enrichedUsers.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenAdd = () => {
    setEmail('');
    generateSampleHash();
    setIsAddOpen(true);
  };

  const generateSampleHash = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let randStr = '';
    for (let i = 0; i < 20; i++) {
      randStr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPasswordHash(`$2a$12$${randStr}`);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    addUser({ email, password_hash: passwordHash || '$2a$12$defaultHashVal' });
    setIsAddOpen(false);
    if (onCloseCreateModal) onCloseCreateModal();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    updateUser(editUser.id, { email: editUser.email, password_hash: editUser.password_hash });
    setEditUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Users Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">User</code> entity records (id, email, password_hash, created_at)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <th className="pb-3">ID</th>
                <th className="pb-3">Email Address</th>
                <th className="pb-3">Password Hash</th>
                <th className="pb-3">Created At</th>
                <th className="pb-3">Progress Stats</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users found matching search query.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {usr.id}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-700 dark:text-slate-300">
                          {usr.email.charAt(0).toUpperCase()}
                        </div>
                        <span>{usr.email}</span>
                      </div>
                    </td>

                    {/* Hash */}
                    <td className="py-3.5 font-mono text-[10px] text-slate-400 max-w-[140px] truncate" title={usr.password_hash}>
                      {usr.password_hash}
                    </td>

                    {/* Created At */}
                    <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(usr.created_at).toLocaleDateString()}
                    </td>

                    {/* Progress */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                          {usr.totalCompleted} Completed
                        </span>
                        <span className="text-slate-400 text-[10px]">Avg {usr.averageScore}%</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewProgressUser(usr)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View User Progress"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditUser(usr)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit User Credentials"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete user ${usr.email}?`)) deleteUser(usr.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isAddOpen || !!isOpenCreateModal}
        onClose={() => {
          setIsAddOpen(false);
          if (onCloseCreateModal) onCloseCreateModal();
        }}
        title="Create New User"
        subtitle="Insert a new row into the User schema entity"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Password Hash
              </label>
              <button
                type="button"
                onClick={generateSampleHash}
                className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" />
                Generate Hash
              </button>
            </div>
            <input
              type="text"
              required
              value={passwordHash}
              onChange={(e) => setPasswordHash(e.target.value)}
              placeholder="$2a$12$..."
              className="w-full px-3 py-2 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                if (onCloseCreateModal) onCloseCreateModal();
              }}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
            >
              Save User
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        title="Edit User Entity"
        subtitle={`Editing User ID: ${editUser?.id}`}
      >
        {editUser && (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password Hash
              </label>
              <input
                type="text"
                required
                value={editUser.password_hash}
                onChange={(e) => setEditUser({ ...editUser, password_hash: e.target.value })}
                className="w-full px-3 py-2 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* VIEW USER PROGRESS DRAWER MODAL */}
      <Modal
        isOpen={!!viewProgressUser}
        onClose={() => setViewProgressUser(null)}
        title={`User Progress Summary: ${viewProgressUser?.email}`}
        subtitle={`User ID: ${viewProgressUser?.id}`}
        maxWidth="2xl"
      >
        {viewProgressUser && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
              <div>
                <span className="text-slate-400 text-[10px] block">Total Enrolled</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                  {viewProgressUser.progressList.length}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-semibold">Completed</span>
                <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                  {viewProgressUser.totalCompleted}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Average Score</span>
                <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">
                  {viewProgressUser.averageScore}%
                </span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 dark:text-slate-100 pt-2">Enrolled Content Breakdown:</h4>

            {viewProgressUser.progressList.length === 0 ? (
              <p className="text-slate-400 italic py-4 text-center">No active progress records for this user.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {viewProgressUser.progressList.map((p) => (
                  <div key={p.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{p.content_title}</div>
                      <div className="text-[10px] text-slate-400">
                        Content ID: {p.content_id} | Last Active: {new Date(p.last_seen).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-black text-slate-900 dark:text-slate-100">{p.score}%</div>
                        <span className={`text-[10px] font-bold ${p.completed ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {p.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
