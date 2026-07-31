import React, { useState, useEffect } from 'react';
import { 
  Tags, Plus, Search, Edit2, Trash2, Filter, 
  Hash, Layers, Sparkles 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { Tag, TagType, EnrichedTag } from '../../types/cms';
import { Modal } from '../common/Modal';
import { Pagination } from '../common/Pagination';

export const TagsManagerView: React.FC<{ isOpenCreateModal?: boolean; onCloseCreateModal?: () => void }> = ({
  isOpenCreateModal,
  onCloseCreateModal,
}) => {
  const { 
    getEnrichedTags, addTag, updateTag, deleteTag, 
    searchQuery, fetchTags
  } = useCMS();

  useEffect(() => {
    fetchTags();
  }, []);

  const enrichedTags = getEnrichedTags();

  // Local Filter
  const [selectedType, setSelectedType] = useState<TagType | 'all'>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTag, setEditTag] = useState<Tag | null>(null);
  const [task , setTask]     = useState<Boolean>(false)
  // Form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [type, setType] = useState<TagType>('category');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addTag({ name, slug: slug || name.toLowerCase().replace(/\s+/g, '-'), type });
    setIsAddOpen(false);
    if (onCloseCreateModal) onCloseCreateModal();
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTag) return;
    updateTag(editTag.id, { name: editTag.name, slug: editTag.slug, type: editTag.type });
    setEditTag(null);
  };

  const filteredTags = enrichedTags.filter((t) => {
    const matchesQuery = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || t.type === selectedType;
    return matchesQuery && matchesType;
  });

  const paginatedTags = filteredTags.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getTypeBadgeClass = (t: TagType) => {
    switch (t) {
      case 'category':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
      case 'level':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300';
      case 'topic':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
      case 'kind':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Tags className="w-5 h-5 text-purple-500" />
            Tags & Taxonomy Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">Tag</code> entity records across category, level, topic, and kind taxonomy types
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setSlug('');
            setType('category');
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Tag
        </button>
      </div>

      {/* Filter Tabs by Type */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {(['all', 'category', 'level', 'topic', 'kind'] as const).map((t) => (
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
            {t === 'all' ? 'All Taxonomies' : `${t}s`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold tracking-wider">
                <th className="pb-3">ID</th>
                <th className="pb-3">Tag Name</th>
                <th className="pb-3">Slug</th>
                <th className="pb-3">Taxonomy Type</th>
                <th className="pb-3">Linked Content</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedTags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No tags found for this taxonomy type.
                  </td>
                </tr>
              ) : (
                paginatedTags.map((tag) => (
                  <tr key={tag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {/* ID */}
                    <td className="py-3.5 font-mono text-purple-600 dark:text-purple-400 font-bold">
                      {tag.id}
                    </td>

                    {/* Name */}
                    <td className="py-3.5 font-extrabold text-slate-900 dark:text-slate-100">
                      {tag.name}
                    </td>

                    {/* Slug */}
                    <td className="py-3.5">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        /{tag.slug}
                      </span>
                    </td>

                    {/* Type */}
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getTypeBadgeClass(tag.type)}`}>
                        {tag.type}
                      </span>
                    </td>

                    {/* Linked Content Count */}
                    <td className="py-3.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {tag.contentCount} items
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditTag(tag)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Tag"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete tag "${tag.name}"? This removes related ContentTag entries.`)) deleteTag(tag.id);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Tag"
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
          totalItems={filteredTags.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* CREATE TAG MODAL */}
      <Modal
        isOpen={isAddOpen || !!isOpenCreateModal}
        onClose={() => {
          setIsAddOpen(false);
          if (onCloseCreateModal) onCloseCreateModal();
        }}
        title="Create New Tag"
        subtitle="Add a new taxonomy item to the Tag table"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            <div>
              <button
              type="button"
              onClick={() => {
                 setTask(!task);
              }}
              className="px-4 py-2 rounded-xl bg-green-600 text-slate-600 text-white  font-semibold"
            >
              {!task ? " add new type": "use existing type"}
            </button>
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Tag Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Next.js 15, Beginner, UI Design"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              URL Slug
            </label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. next-js-15"
              className="w-full px-3 py-2 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>
       {task ? (
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Taxonomy Type
            </label>
            <input
              type="text"
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g. category"
              className="w-full px-3 py-2 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        ) : (
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Taxonomy Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TagType)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 font-semibold"
            >
              <option value="category">Category</option>
              <option value="level">Level (Difficulty)</option>
              <option value="topic">Topic (Technology/Subject)</option>
              <option value="kind">Kind (Core/Elective/Workshop)</option>
            </select>
          </div>
        )}
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
              Save Tag
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT TAG MODAL */}
      <Modal
        isOpen={!!editTag}
        onClose={() => setEditTag(null)}
        title="Edit Tag Entity"
        subtitle={`Editing Tag ID: ${editTag?.id}`}
      >
        {editTag && (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tag Name
              </label>
              <input
                type="text"
                required
                value={editTag.name}
                onChange={(e) => setEditTag({ ...editTag, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Slug
              </label>
              <input
                type="text"
                required
                value={editTag.slug}
                onChange={(e) => setEditTag({ ...editTag, slug: e.target.value })}
                className="w-full px-3 py-2 font-mono text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
              />
            </div>
   

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Taxonomy Type
              </label>
              <select
                value={editTag.type}
                onChange={(e) => setEditTag({ ...editTag, type: e.target.value as TagType })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100 font-semibold"
              >
                <option value="category">Category</option>
                <option value="level">Level</option>
                <option value="topic">Topic</option>
                <option value="kind">Kind</option>
              </select>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditTag(null)}
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
