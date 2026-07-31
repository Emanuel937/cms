import React, { useState, useEffect } from 'react';
import { 
  Link2, Plus, Trash2, Search, Filter, 
  Layers, Tags, FileText, Check, Sparkles
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';

export const ContentTagManagerView: React.FC = () => {
  const { 
    contentTag, content, tags, 
    assignTagToContent, removeTagFromContent, setTagsForContent,
    getEnrichedContentTags, searchQuery,
    fetchContentTag, fetchContent, fetchTags
  } = useCMS();

  useEffect(() => {
    fetchContentTag();
    fetchContent();
    fetchTags();
  }, []);

  const enrichedCTs = getEnrichedContentTags();

  const [activeView, setActiveView] = useState<'matrix' | 'table'>('matrix');
  const [selectedContentId, setSelectedContentId] = useState<string>(content[0]?.id || '');
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Form
  const [assignContentId, setAssignContentId] = useState(content[0]?.id || '');
  const [assignTagId, setAssignTagId] = useState(tags[0]?.id || '');

  // Pagination for table mode
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredCTs = enrichedCTs.filter((ct) =>
    ct.content_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.tag_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ct.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedCTs = filteredCTs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignContentId || !assignTagId) return;
    assignTagToContent(assignContentId, assignTagId);
    setIsAssignModalOpen(false);
  };

  const selectedContentObj = content.find((c) => c.id === selectedContentId);
  const activeLinkedTagIds = contentTag
    .filter((ct) => ct.content_id === selectedContentId)
    .map((ct) => ct.tag_id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-500" />
            ContentTag Relations Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage many-to-many junction relations in <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">ContentTag</code> (id, content_id, tag_id)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveView('matrix')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'matrix'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Interactive Matrix
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeView === 'table'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Junction Table
            </button>
          </div>

          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            Assign Tag
          </button>
        </div>
      </div>

      {/* MATRIX VIEW */}
      {activeView === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Content Item Selector */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              1. Select Content Item
            </h3>
            <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
              {content.map((c) => {
                const isSelected = c.id === selectedContentId;
                const count = contentTag.filter((ct) => ct.content_id === c.id).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedContentId(c.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100 font-bold'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate font-bold">{c.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                      <span className="uppercase">{c.type}</span>
                      <span>{count} tags attached</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Attached Tags Toggle Canvas */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                <Tags className="w-4 h-4 text-purple-500" />
                2. Toggle Tags Linked to: <span className="text-blue-600 dark:text-blue-400">{selectedContentObj?.title}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Click any tag to attach or remove relation in real-time.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {tags.map((t) => {
                const isLinked = activeLinkedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      if (isLinked) {
                        removeTagFromContent(selectedContentId, t.id);
                      } else {
                        assignTagToContent(selectedContentId, t.id);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs text-left transition-all flex flex-col justify-between h-20 ${
                      isLinked
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="font-extrabold truncate">{t.name}</div>
                    <div className="flex items-center justify-between text-[10px] opacity-80">
                      <span className="capitalize">{t.type}</span>
                      <span className="font-bold">{isLinked ? '✓ Linked' : '+ Link'}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* JUNCTION TABLE VIEW */}
      {activeView === 'table' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                  <th className="pb-3">Junction ID</th>
                  <th className="pb-3">Content ID & Title</th>
                  <th className="pb-3">Tag ID & Name</th>
                  <th className="pb-3">Tag Type</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginatedCTs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No relation entries found in ContentTag table.
                    </td>
                  </tr>
                ) : (
                  paginatedCTs.map((ct) => (
                    <tr key={ct.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 font-mono text-blue-600 dark:text-blue-400 font-bold">
                        {ct.id}
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                          {ct.content_title}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">{ct.content_id}</div>
                      </td>

                      <td className="py-3.5">
                        <div className="font-bold text-purple-600 dark:text-purple-400">
                          {ct.tag_name}
                        </div>
                        <div className="font-mono text-[10px] text-slate-400">{ct.tag_id}</div>
                      </td>

                      <td className="py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {ct.tag_type}
                        </span>
                      </td>

                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => removeTagFromContent(ct.content_id, ct.tag_id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Remove Junction Relation"
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
            totalItems={filteredCTs.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* ASSIGN TAG MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Tag to Content"
        subtitle="Insert a new row into ContentTag junction table"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Content
            </label>
            <select
              value={assignContentId}
              onChange={(e) => setAssignContentId(e.target.value)}
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
              Select Tag
            </label>
            <select
              value={assignTagId}
              onChange={(e) => setAssignTagId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
            >
              Assign Relation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
