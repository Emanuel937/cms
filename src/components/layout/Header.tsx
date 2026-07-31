import React, { useState } from 'react';
import { 
  Menu, Search, Plus, Moon, Sun, Download, RefreshCw, 
  UserPlus, FilePlus, Tag, Database, ChevronDown, Sparkles, LogOut, User as UserIcon
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

interface HeaderProps {
  onOpenCreateUser: () => void;
  onOpenCreateTag: () => void;
  onOpenCreateContent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateUser,
  onOpenCreateTag,
  onOpenCreateContent,
}) => {
  const { 
    darkMode, toggleDarkMode, searchQuery, setSearchQuery, 
    sidebarCollapsed, setSidebarCollapsed, resetToDefaultData, exportDataJSON,
    currentUser, logout
  } = useCMS();

  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-800 transition-colors">
      {/* Left: Sidebar Toggle & Search */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 rounded-lg text-[#64748B] hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users, content, or tags..."
            className="w-full pl-9 pr-4 py-2 text-xs md:text-sm bg-[#F1F5F9] dark:bg-slate-800 border border-transparent focus:border-[#3B82F6] rounded-lg text-[#1E293B] dark:text-slate-100 placeholder-[#64748B] focus:outline-none transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#64748B] hover:text-slate-900 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Item</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {quickMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setQuickMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl shadow-lg py-2 z-20 text-xs font-medium">
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenCreateContent();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
                >
                  <FilePlus className="w-4 h-4 text-[#3B82F6]" />
                  New Content
                </button>
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenCreateUser();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-500" />
                  New User
                </button>
                <button
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenCreateTag();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
                >
                  <Tag className="w-4 h-4 text-purple-500" />
                  New Tag
                </button>
              </div>
            </>
          )}
        </div>

        {/* Export JSON button */}
        <button
          onClick={exportDataJSON}
          className="p-2 text-[#64748B] hover:text-slate-900 dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
          title="Export JSON Database"
        >
          <Download className="w-4 h-4" />
          <span className="hidden md:inline">Export</span>
        </button>

        {/* Reset Database */}
        <button
          onClick={resetToDefaultData}
          className="p-2 text-[#64748B] hover:text-slate-900 dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 rounded-lg transition-colors hidden lg:flex items-center gap-1.5 text-xs font-medium"
          title="Reset to Demo Data"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="hidden md:inline">Reset Seed</span>
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg text-[#64748B] dark:text-slate-300 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* User Profile Area */}
        <div className="relative border-l border-[#E2E8F0] dark:border-slate-800 pl-3 ml-1">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="hidden xl:block text-right">
              <div className="text-xs font-bold text-[#1E293B] dark:text-slate-100 leading-tight truncate max-w-[140px]">
                {currentUser?.email.split('@')[0] || 'Admin User'}
              </div>
              <div className="text-[10px] text-[#64748B] font-medium uppercase tracking-wider">
                Administrator
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#3858E9] text-white flex items-center justify-center font-bold text-xs border border-white/20 shadow-sm uppercase">
              {currentUser?.email ? currentUser.email.slice(0, 2) : 'WP'}
            </div>
          </button>

          {profileMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-20 text-xs">
                <div className="pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                    {currentUser?.email || 'admin@cms-studio.io'}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    ID: {currentUser?.id || 'usr_01'}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => { resetToDefaultData(); setProfileMenuOpen(false); }}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    Reset Initial Seed
                  </button>
                  <button 
                    onClick={() => { exportDataJSON(); setProfileMenuOpen(false); }}
                    className="flex items-center gap-2 px-2.5 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left transition-colors"
                  >
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    Backup Database Dump
                  </button>

                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left font-bold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Log Out of Admin
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
