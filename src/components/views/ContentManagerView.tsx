import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Edit2, Trash2, Eye, Link2, 
  Key, Calendar, Check, Sparkles, Layers, BookOpen, FileCode,
  Heading, Image as ImageIcon, Video as VideoIcon, Type, Quote, List, Code as CodeIcon
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { Content, ContentType, EnrichedContent } from '../../types/cms';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';
import { WordPressEditor } from '../editor/WordPressEditor';
import { QuillEditor } from '../editor/QuillEditor';

export const ContentManagerView: React.FC<{ isOpenCreateModal?: boolean; onCloseCreateModal?: () => void }> = ({
  isOpenCreateModal,
  onCloseCreateModal,
}) => {
  const { 
    getEnrichedContent, tags, addContent, updateContent, deleteContent, 
    addContentMeta, deleteContentMeta, setTagsForContent, searchQuery,
    fetchContent, fetchTags, fetchContentMeta, fetchContentTag
  } = useCMS();

  useEffect(() => {
    fetchContent();
    fetchTags();
    fetchContentMeta();
    fetchContentTag();
  }, []);

  const enrichedContents = getEnrichedContent();

  const [selectedType, setSelectedType] = useState<ContentType | 'all'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeContentEditor, setActiveContentEditor] = useState<EnrichedContent | null>(null);

  // Create Form State
  const [type, setType] = useState<ContentType>('article');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [metaKey, setMetaKey] = useState('');
  const [metaValue, setMetaValue] = useState('');
  const [metaPairs, setMetaPairs] = useState<{ key: string; value: string }[]>([]);

  // Editor Tabs
  const [editorTab, setEditorTab] = useState<'details' | 'tags' | 'meta' | 'preview'>('details');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredContents = enrichedContents.filter((c) => {
    const matchesQuery = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || c.type === selectedType;
    return matchesQuery && matchesType;
  });

  const paginatedContents = filteredContents.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleAddMetaPair = () => {
    if (!metaKey || !metaValue) return;
    setMetaPairs([...metaPairs, { key: metaKey, value: metaValue }]);
    setMetaKey('');
    setMetaValue('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    addContent({ type, title, body }, selectedTagIds, metaPairs);
    setIsAddOpen(false);
    if (onCloseCreateModal) onCloseCreateModal();
    // Reset form
    setTitle('');
    setBody('');
    setSelectedTagIds([]);
    setMetaPairs([]);
  };

  const getTypeBadge = (t: ContentType) => {
    switch (t) {
      case 'article':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'course':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300';
      case 'lesson':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      case 'quiz':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
      case 'page':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            Content Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Content</code> entity records (type, title, body, created_at)
          </p>
        </div>

        <button
          onClick={() => {
            setTitle('');
            setBody('# New Content Title\n\nWrite content body here...');
            setSelectedTagIds([]);
            setMetaPairs([]);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Content
        </button>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(['all', 'article', 'course', 'lesson', 'quiz', 'page'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setSelectedType(t);
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl font-bold capitalize transition-all shrink-0 ${
              selectedType === t
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {t === 'all' ? 'All Content Types' : `${t}s`}
          </button>
        ))}
      </div>

      {/* Content Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <th className="pb-3">ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Title</th>
                <th className="pb-3">Attached Tags</th>
                <th className="pb-3">Metadata</th>
                <th className="pb-3">Created At</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedContents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No content items found.
                  </td>
                </tr>
              ) : (
                paginatedContents.map((cnt) => (
                  <tr key={cnt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                      {cnt.id}
                    </td>

                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeBadge(cnt.type)}`}>
                        {cnt.type}
                      </span>
                    </td>

                    <td className="py-3.5 font-extrabold text-slate-900 dark:text-slate-100 max-w-xs truncate">
                      {cnt.title}
                    </td>

                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {cnt.tags.length === 0 ? (
                          <span className="text-slate-400 italic text-[10px]">No tags</span>
                        ) : (
                          cnt.tags.map((t) => (
                            <span key={t.id} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px]">
                              {t.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>

                    <td className="py-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {cnt.meta.length} keys
                      </span>
                    </td>

                    <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(cnt.created_at).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setActiveContentEditor(cnt);
                            setEditorTab('details');
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Full Content Editor Studio"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete content "${cnt.title}"?`)) deleteContent(cnt.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Content"
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
          totalItems={filteredContents.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* CREATE CONTENT MODAL */}
      <Modal
        isOpen={isAddOpen || !!isOpenCreateModal}
        onClose={() => {
          setIsAddOpen(false);
          if (onCloseCreateModal) onCloseCreateModal();
        }}
        title="Create Content Entity"
        subtitle="Insert a new record into Content, ContentTag, and ContentMeta tables"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Content Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master React 19 Server Components"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Content Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="article">Article</option>
                <option value="course">Course</option>
                <option value="lesson">Lesson</option>
                <option value="quiz">Quiz</option>
                <option value="page">Page</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Content Body (Quill WYSIWYG & Media Library Integration)
            </label>
            <QuillEditor
              value={body}
              onChange={setBody}
              minHeight="260px"
              placeholder="Write rich formatted content, add headings, blockquotes, code snippets, or pick images and videos from Media Library..."
            />
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Attach Initial Tags (ContentTag Relation)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              {tags.map((t) => {
                const isSelected = selectedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTagIds(selectedTagIds.filter((id) => id !== t.id));
                      } else {
                        setSelectedTagIds([...selectedTagIds, t.id]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{t.name} ({t.type})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Meta Pairs */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Add Initial Metadata (ContentMeta Pairs)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Key (e.g. author, read_time)"
                value={metaKey}
                onChange={(e) => setMetaKey(e.target.value)}
                className="w-1/3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                placeholder="Value"
                value={metaValue}
                onChange={(e) => setMetaValue(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddMetaPair}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold rounded-xl"
              >
                Add Key
              </button>
            </div>

            {metaPairs.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {metaPairs.map((pair, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 rounded-lg text-[11px] font-mono flex items-center gap-1.5">
                    <strong>{pair.key}:</strong> {pair.value}
                    <button
                      type="button"
                      onClick={() => setMetaPairs(metaPairs.filter((_, i) => i !== idx))}
                      className="text-rose-500 font-bold hover:opacity-80 ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              Save Content Record
            </button>
          </div>
        </form>
      </Modal>

      {/* FULL WORDPRESS CONTENT EDITOR STUDIO OVERLAY */}
      {activeContentEditor && (
        <WordPressEditor
          contentItem={activeContentEditor}
          onClose={() => setActiveContentEditor(null)}
        />
      )}
    </div>
  );
};
