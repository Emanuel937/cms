import React, { useState } from 'react';
import { Database, Key, ArrowRight, ShieldCheck, Layers, GitFork, Link2, Copy, Check, Globe, Code } from 'lucide-react';
import { API_ENDPOINTS, BASE_API_URL } from '../../config';

export const SchemaVisualizerView: React.FC = () => {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(text);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };
  const schemaEntities = [
    {
      name: 'User',
      color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30',
      badge: 'User Auth Table',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', key: 'PK', desc: 'Unique user identifier' },
        { name: 'email', type: 'VARCHAR UNIQUE', desc: 'Primary user email' },
        { name: 'password_hash', type: 'VARCHAR', desc: 'Bcrypt hashed string' },
        { name: 'created_at', type: 'TIMESTAMP', desc: 'Account registration date' },
      ],
    },
    {
      name: 'Tag',
      color: 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30',
      badge: 'Taxonomy Table',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', key: 'PK', desc: 'Unique tag identifier' },
        { name: 'name', type: 'VARCHAR', desc: 'Human tag display name' },
        { name: 'slug', type: 'VARCHAR UNIQUE', desc: 'URL safe slug string' },
        { name: 'type', type: 'ENUM', desc: "'category' | 'level' | 'topic' | 'kind'" },
        { name: 'created_at', type: 'TIMESTAMP', desc: 'Tag creation date' },
      ],
    },
    {
      name: 'Content',
      color: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30',
      badge: 'Core Content Table',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', key: 'PK', desc: 'Unique content identifier' },
        { name: 'type', type: 'ENUM', desc: "'article' | 'course' | 'lesson' | 'quiz' | 'page'" },
        { name: 'title', type: 'VARCHAR', desc: 'Content headline/title' },
        { name: 'body', type: 'TEXT', desc: 'Markdown body text' },
        { name: 'created_at', type: 'TIMESTAMP', desc: 'Publishing timestamp' },
      ],
    },
    {
      name: 'ContentMeta',
      color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30',
      badge: 'Key-Value Metadata Table',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', key: 'PK', desc: 'Unique metadata identifier' },
        { name: 'content_id', type: 'VARCHAR (FK)', key: 'FK', desc: 'References Content.id' },
        { name: 'key', type: 'VARCHAR', desc: 'Metadata key (e.g. read_time)' },
        { name: 'value', type: 'TEXT', desc: 'Metadata value payload' },
      ],
    },
    {
      name: 'ContentTag',
      color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30',
      badge: 'Many-to-Many Junction Table',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', key: 'PK', desc: 'Junction row identifier' },
        { name: 'content_id', type: 'VARCHAR (FK)', key: 'FK', desc: 'References Content.id' },
        { name: 'tag_id', type: 'VARCHAR (FK)', key: 'FK', desc: 'References Tag.id' },
      ],
    },
    {
      name: 'UserProgress',
      color: 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30',
      badge: 'Progress Tracking Table',
      fields: [
        { name: 'id', type: 'VARCHAR (PK)', key: 'PK', desc: 'Unique progress identifier' },
        { name: 'user_id', type: 'VARCHAR (FK)', key: 'FK', desc: 'References User.id' },
        { name: 'content_id', type: 'VARCHAR (FK)', key: 'FK', desc: 'References Content.id' },
        { name: 'score', type: 'INTEGER', desc: 'Score percentage (0-100)' },
        { name: 'completed', type: 'BOOLEAN', desc: 'Completion status flag' },
        { name: 'last_seen', type: 'TIMESTAMP', desc: 'Last interaction ISO date' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/50 text-blue-600 rounded-2xl">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">
              Database Entity-Relationship Diagram (ERD)
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Exact relational representation of your 6 CMS schema tables and foreign key constraints
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {schemaEntities.map((entity) => (
          <div
            key={entity.name}
            className={`rounded-2xl border-2 ${entity.color} p-5 bg-white dark:bg-slate-900 shadow-sm space-y-3`}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-slate-900 dark:text-slate-100">
                  {entity.name}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {entity.badge}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {entity.fields.map((f) => (
                <div key={f.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 font-mono">
                  <div className="flex items-center gap-2">
                    {f.key === 'PK' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[9px]">
                        PK
                      </span>
                    )}
                    {f.key === 'FK' && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[9px]">
                        FK
                      </span>
                    )}
                    <span className="font-bold text-slate-900 dark:text-slate-100">{f.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans">{f.type}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FK Relationship Map Explanation */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
          <GitFork className="w-4 h-4" />
          Foreign Key Relations Map
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-amber-400 font-mono">ContentMeta.content_id</span>
            <span className="text-slate-400"> ──1:N──► </span>
            <span className="font-bold text-indigo-400 font-mono">Content.id</span>
            <p className="text-[11px] text-slate-400 mt-1">One Content item can store multiple metadata key-value pairs.</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-emerald-400 font-mono">ContentTag.content_id & tag_id</span>
            <span className="text-slate-400"> ──N:M──► </span>
            <span className="font-bold text-purple-400 font-mono">Content.id + Tag.id</span>
            <p className="text-[11px] text-slate-400 mt-1">Junction table enabling many-to-many tag attachments.</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-rose-400 font-mono">UserProgress.user_id</span>
            <span className="text-slate-400"> ──1:N──► </span>
            <span className="font-bold text-blue-400 font-mono">User.id</span>
            <p className="text-[11px] text-slate-400 mt-1">Tracks enrolled content, score %, and completion status per user.</p>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-rose-400 font-mono">UserProgress.content_id</span>
            <span className="text-slate-400"> ──1:N──► </span>
            <span className="font-bold text-indigo-400 font-mono">Content.id</span>
            <p className="text-[11px] text-slate-400 mt-1">Tracks student completion statistics for each content module.</p>
          </div>
        </div>
      </div>

      {/* Centralized API Links & Database Endpoints Configuration Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Centralized Database API Request Links</span>
                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold rounded-md">
                  src/config/apiEndpoints.ts
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All backend endpoints and database request paths are centrally declared. To point to another database or backend server, update <code className="text-blue-500 font-bold">src/config/apiEndpoints.ts</code>.
              </p>
            </div>
          </div>

          <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 flex items-center gap-2 border border-slate-200 dark:border-slate-700">
            <span className="text-slate-400">Base API Host:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{BASE_API_URL}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(API_ENDPOINTS).map(([key, endpoint]) => (
            <div
              key={key}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center justify-between gap-2"
            >
              <div className="overflow-hidden">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {key.replace('_', ' ')}
                </span>
                <code className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5" title={endpoint}>
                  {endpoint}
                </code>
              </div>

              <button
                onClick={() => handleCopy(endpoint)}
                className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition cursor-pointer shrink-0"
                title="Copy API Link"
              >
                {copiedEndpoint === endpoint ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
