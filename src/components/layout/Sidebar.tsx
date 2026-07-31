import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Tags, FileText, Key, Link2, 
  TrendingUp, Database, Palette, Shield, Image as ImageIcon
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

export const Sidebar: React.FC = () => {
  const { 
    sidebarCollapsed, 
    users, tags, content, contentMeta, contentTag, userProgress, mediaAssets 
  } = useCMS();

  const navItems: {
    path: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    description: string;
  }[] = [
    {
      path: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
    },
    {
      path: '/users',
      label: 'Users Manager',
      icon: Users,
      badge: users.length,
      description: 'User table & progress',
    },
    {
      path: '/tags',
      label: 'Tags Manager',
      icon: Tags,
      badge: tags.length,
      description: 'Categories & topics',
    },
    {
      path: '/content',
      label: 'Content Manager',
      icon: FileText,
      badge: content.length,
      description: 'Articles, courses, pages',
    },
    {
      path: '/media',
      label: 'Media Library',
      icon: ImageIcon,
      badge: mediaAssets?.length || 0,
      description: 'Upload images, videos, tags',
    },
    {
      path: '/content-meta',
      label: 'ContentMeta',
      icon: Key,
      badge: contentMeta.length,
      description: 'Key-value pairs',
    },
    {
      path: '/content-tag',
      label: 'ContentTag Matrix',
      icon: Link2,
      badge: contentTag.length,
      description: 'Junction relations',
    },
    {
      path: '/user-progress',
      label: 'User Progress',
      icon: TrendingUp,
      badge: userProgress.length,
      description: 'Scores & completion',
    },
    {
      path: '/schema',
      label: 'Schema Diagram',
      icon: Database,
      description: 'Entities & ERD Model',
    },
    {
      path: '/design-system',
      label: 'Design System',
      icon: Palette,
      description: 'Tokens & components',
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-[#1E293B] text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800/80 bg-[#1E293B]">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center text-white shrink-0 shadow-sm font-extrabold text-xs">
            WP
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-white tracking-tight leading-none">
                CMS Admin
              </span>
              <span className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wider">
                WordPress Schema
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <div className={`px-2 pb-2 text-[10px] font-bold text-[#64748B] uppercase tracking-wider ${sidebarCollapsed ? 'sr-only' : ''}`}>
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-white/10 text-white font-semibold shadow-sm'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/5'
                }`
              }
              title={sidebarCollapsed ? item.label : undefined}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isActive ? 'text-white' : 'text-[#64748B] group-hover:text-slate-200'
                      }`}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!sidebarCollapsed && item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/60'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info */}
      {!sidebarCollapsed && (
        <div className="p-3 m-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>PostgreSQL Ready</span>
          </div>
          <p className="text-[10px] text-slate-400 opacity-90 leading-relaxed">
            Modular route structure with on-demand API endpoints.
          </p>
        </div>
      )}
    </aside>
  );
};

