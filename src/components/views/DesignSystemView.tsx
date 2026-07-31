import React from 'react';
import { 
  Palette, Type, Layers, CheckCircle, Navigation, 
  Sparkles, MousePointer, Box, Shield, Hash 
} from 'lucide-react';

export const DesignSystemView: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 text-white rounded-2xl p-8 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Complete CMS Design System & Documentation</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight">WordPress & Ghost Inspired Design Tokens</h1>
        <p className="mt-2 text-sm text-slate-300 max-w-2xl leading-relaxed">
          Comprehensive specifications for layout hierarchy, UX flows, component library standards, color palettes, and typographic scales tailored to the 6 schema entities.
        </p>
      </div>

      {/* 1. Color Palette */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-500" />
          1. Color Palette & Dark Mode Strategy
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-[#3B82F6] shadow-md flex items-end p-2 text-white font-bold font-mono">
              #3B82F6
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100">Blue Accent (Primary)</div>
            <p className="text-[11px] text-slate-500">Buttons, active tabs, focus rings, primary highlights</p>
          </div>

          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-slate-900 shadow-md flex items-end p-2 text-white font-bold font-mono border border-slate-700">
              #0F172A
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100">Slate 900 (Dark Canvas)</div>
            <p className="text-[11px] text-slate-500">Primary background in dark mode and dark sidebar headers</p>
          </div>

          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-slate-50 border border-slate-200 shadow-sm flex items-end p-2 text-slate-900 font-bold font-mono">
              #F8FAFC
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100">Slate 50 (Light Canvas)</div>
            <p className="text-[11px] text-slate-500">Clean, soft off-white background for reduced eye fatigue</p>
          </div>

          <div className="space-y-2">
            <div className="h-16 rounded-xl bg-emerald-500 shadow-md flex items-end p-2 text-white font-bold font-mono">
              #10B981
            </div>
            <div className="font-bold text-slate-900 dark:text-slate-100">Emerald Success</div>
            <p className="text-[11px] text-slate-500">Completed progress badges, positive metrics</p>
          </div>
        </div>
      </div>

      {/* 2. Typography & Spacing */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Type className="w-5 h-5 text-indigo-500" />
          2. Typographic Hierarchy & Spacing Grid
        </h2>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
            <span className="font-black text-2xl text-slate-900 dark:text-slate-100">Heading 1 (24px / 1.5rem)</span>
            <span className="font-mono text-slate-400">font-extrabold tracking-tight</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
            <span className="font-bold text-lg text-slate-900 dark:text-slate-100">Heading 2 (18px / 1.125rem)</span>
            <span className="font-mono text-slate-400">font-bold text-slate-900</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
            <span className="text-sm text-slate-700 dark:text-slate-300">Body Text (14px / 0.875rem)</span>
            <span className="font-mono text-slate-400">leading-relaxed text-slate-600</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between">
            <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">Code / Identifiers (12px)</span>
            <span className="font-mono text-slate-400">font-mono bg-slate-100 px-1</span>
          </div>
        </div>
      </div>

      {/* 3. UX Flow & Layout Architecture */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-500" />
          3. UX Flow & Layout Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Collapsible Sidebar</h3>
            <p className="text-slate-500 leading-relaxed">
              Provides instant navigation across Dashboard, Users, Tags, Content, ContentMeta, ContentTag Matrix, and UserProgress. Features count badges and tooltips when collapsed.
            </p>
          </div>

          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Top Global Header Bar</h3>
            <p className="text-slate-500 leading-relaxed">
              Houses instant search filter, quick creation dropdown menu, dark mode toggle, and JSON database backup triggers.
            </p>
          </div>

          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Modal Forms & Drawer Studios</h3>
            <p className="text-slate-500 leading-relaxed">
              Equipped with backdrop blur, keyboard ESC dismissal, tabbed sub-editors, auto slug generation, and form validators.
            </p>
          </div>

          <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Interactive Data Tables</h3>
            <p className="text-slate-500 leading-relaxed">
              Equipped with pagination, empty states, hover rows, score sliders, and instant toggle buttons.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Icon Dictionary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Box className="w-5 h-5 text-amber-500" />
          4. Suggested Icon Dictionary (Lucide Icons)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">Users</div>
            <div className="text-[10px] text-slate-400">User table</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">FileText</div>
            <div className="text-[10px] text-slate-400">Content table</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">Tags</div>
            <div className="text-[10px] text-slate-400">Tag table</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">Key</div>
            <div className="text-[10px] text-slate-400">ContentMeta</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">Link2</div>
            <div className="text-[10px] text-slate-400">ContentTag</div>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="font-bold text-slate-800 dark:text-slate-200 mt-1">TrendingUp</div>
            <div className="text-[10px] text-slate-400">UserProgress</div>
          </div>
        </div>
      </div>
    </div>
  );
};
