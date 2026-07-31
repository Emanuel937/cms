import React, { useState, useEffect } from 'react';
import { 
  Key, Plus, Search, Edit2, Trash2, Filter, 
  FileText, Sparkles 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { ContentMeta } from '../../types/cms';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';

export const ContentMetaManagerView: React.FC = () => {
  const { 
    contentMeta, content, addContentMeta, updateContentMeta, deleteContentMeta, 
    searchQuery, fetchContentMeta, fetchContent
  } = useCMS();

  useEffect(() => {
    fetchContentMeta();
    fetchContent();
  }, []);

  const [selectedContentId, setSelectedContentId] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editMeta, setEditMeta] = useState<ContentMeta | null>(null);

  // Form State
  const [contentId, setContentId] = useState('');
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Key presets for fast creation
  const keyPresets = [
    'seo_title', 'featured', 'author', 'read_time_minutes', 
    'difficulty_rating', 'canonical_url', 'og_image'
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentId || !key) return;
    addContentMeta({ content_id: contentId, key, value });
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMeta) return;
    updateContentMeta(editMeta.id, { key: editMeta.key, value: editMeta.value });
    setEditMeta(null);
  };

  const enrichedMeta = contentMeta.map((m) => {
    const parentContent = content.find((c) => c.id === m.content_id);
    return {
      ...m,
      content_title: parentContent?.title || 'Unknown Content',
      content_type: parentContent?.type || 'article',
    };
  });

  const filteredMeta = enrichedMeta.filter((m) => {
    const matchesQuery = m.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.content_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesContent = selectedContentId === 'all' || m.content_id === selectedContentId;
    return matchesQuery && matchesContent;
  });

  const paginatedMeta = filteredMeta.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Key className="w-5 h-5 text-amber-500" />
            ContentMeta Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ContentMeta</code> entity records (id, content_id, key, value)
          </p>
        </div>

        <button
          onClick={() => {
            setContentId(content[0]?.id || '');
            setKey('seo_title');
            setValue('');
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Metadata Pair
        </button>
      </div>

      {/* Content Filter */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
        <Filter className="w-4 h-4 text-slate-400" />
        <span className="font-bold text-slate-700 dark:text-slate-300">Filter by Content:</span>
        <select
          value={selectedContentId}
          onChange={(e) => {
            setSelectedContentId(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 max-w-xs px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 font-semibold"
        >
          <option value="all">All Content Records ({contentMeta.length} keys)</option>
          {content.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title} ({c.type})
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <th className="pb-3">ID</th>
                <th className="pb-3">Content Title</th>
                <th className="pb-3">Metadata Key</th>
                <th className="pb-3">Value</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedMeta.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No metadata records found.
                  </td>
                </tr>
              ) : (
                paginatedMeta.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {m.id}
                    </td>

                    <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {m.content_title}
                    </td>

                    <td className="py-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">
                      {m.key}
                    </td>

                    <td className="py-3.5 font-mono text-slate-700 dark:text-slate-300 max-w-xs truncate">
                      {m.value}
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditMeta(m)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Key/Value"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete metadata key "${m.key}"?`)) deleteContentMeta(m.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Metadata Pair"
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
          totalItems={filteredMeta.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* CREATE META MODAL */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Content Meta Record"
        subtitle="Insert key-value pair into ContentMeta entity table"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Target Content
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
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Metadata Key
            </label>
            <input
              type="text"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="e.g. author, featured, read_time"
              className="w-full px-3 py-2 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
            {/* Quick Key Presets */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] text-slate-400 mr-1">Presets:</span>
              {keyPresets.map((kp) => (
                <button
                  key={kp}
                  type="button"
                  onClick={() => setKey(kp)}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-100 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                >
                  {kp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Value
            </label>
            <textarea
              rows={3}
              required
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter metadata value..."
              className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
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
              Save Metadata
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT META MODAL */}
      <Modal
        isOpen={!!editMeta}
        onClose={() => setEditMeta(null)}
        title="Edit Metadata Pair"
        subtitle={`Meta ID: ${editMeta?.id}`}
      >
        {editMeta && (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Metadata Key
              </label>
              <input
                type="text"
                required
                value={editMeta.key}
                onChange={(e) => setEditMeta({ ...editMeta, key: e.target.value })}
                className="w-full px-3 py-2 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Value
              </label>
              <textarea
                rows={3}
                required
                value={editMeta.value}
                onChange={(e) => setEditMeta({ ...editMeta, value: e.target.value })}
                className="w-full p-3 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditMeta(null)}
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
    </div>
  );
};
