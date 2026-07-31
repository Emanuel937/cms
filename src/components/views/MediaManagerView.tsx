import React, { useState, useEffect, ChangeEvent, FormEvent, SyntheticEvent } from 'react';
import { 
  FolderPlus, Upload, Image as ImageIcon, Video, FileText, Music, 
  Search, Trash2, Edit2, Link2, Tag as TagIcon, Eye, Check, 
  Copy, ExternalLink, Filter, Plus, FileCode, CheckCircle2 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { MediaAsset, MediaType } from '../../types/cms';
import {BASE_API_URL} from '@/src/config/apiEndpoints' 

export const MediaManagerView: React.FC = () => {
  const { 
    mediaAssets, addMediaAsset, updateMediaAsset, deleteMediaAsset, 
    tags, content, addToast, linkMediaToTag, unlinkMediaFromTag,
    linkMediaToContent, unlinkMediaFromContent,
    fetchMedia, fetchTags, fetchContent
  } = useCMS();

  useEffect(() => {
    fetchMedia();
    fetchTags();
    fetchContent();
  }, []);

  // Filters state
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [selectedContentFilter, setSelectedContentFilter] = useState<string>('all');
  
  // Modals & Active Edit state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaAsset | null>(null);
  const [previewMedia, setPreviewMedia] = useState<MediaAsset | null>(null);

  // New Upload Form State
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<MediaType>('image');
  const [newCaption, setNewCaption] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [newTagIds, setNewTagIds] = useState<string[]>([]);
  const [newContentIds, setNewContentIds] = useState<string[]>([]);
  const [uploadFile, setUploadFile] = useState<File | null>(null);


  // Filtered Assets Logic
  const filteredAssets = mediaAssets.filter((asset) => {
    if (selectedType !== 'all' && asset.type !== selectedType) return false;
    if (selectedTagFilter !== 'all') {
      if (!asset.linkedTagIds?.includes(selectedTagFilter)) return false;
    }
    if (selectedContentFilter !== 'all') {
      if (!asset.linkedContentIds?.includes(selectedContentFilter)) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = asset.name.toLowerCase().includes(q);
      const matchCap = asset.caption?.toLowerCase().includes(q) || false;
      const matchAlt = asset.altText?.toLowerCase().includes(q) || false;
      return matchName || matchCap || matchAlt;
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!uploadFile) {
    addToast("error", "No file", "Please select a file.");
    return;
  }

  const form = new FormData();
  form.append("file", uploadFile);
  form.append("name", newName);
  form.append("type", newType);
  form.append("size", "1.5 MB");
  form.append("dimensions", newType === "image" ? "1920x1080" : "1080p HD");
  form.append("caption", newCaption);
  form.append("altText", newAltText || newName);

  newTagIds.forEach(id => form.append("linkedTagIds", id));
  newContentIds.forEach(id => form.append("linkedContentIds", id));

  addMediaAsset(form);
  

  // Reset
  setUploadFile(null);
  setNewName("");
  setNewUrl("");
  setNewCaption("");
  setNewAltText("");
  setNewTagIds([]);
  setNewContentIds([]);
  setIsUploadOpen(false);
};


  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFile(file)
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setNewUrl(result);
      if (!newName) setNewName(file.name);
      if (file.type.startsWith('image/')) setNewType('image');
      else if (file.type.startsWith('video/')) setNewType('video');
      else if (file.type.startsWith('audio/')) setNewType('audio');
      else setNewType('document');
    };
    reader.readAsDataURL(file);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast('success', 'URL Copied', 'Media link copied to clipboard.');
  };

  const handleCopyEmbedCode = (asset: MediaAsset) => {
    let embed = '';
    if (asset.type === 'image') {
      embed = `<img src="${asset.url}" alt="${asset.altText || asset.name}" class="rounded-xl shadow-md my-4 max-w-full" />`;
    } else if (asset.type === 'video') {
      embed = `<iframe width="100%" height="400" src="${asset.url}" title="${asset.name}" frameborder="0" allowfullscreen class="rounded-xl my-4"></iframe>`;
    } else if (asset.type === 'audio') {
      embed = `<audio controls src="${asset.url}" class="w-full my-2"></audio>`;
    } else {
      embed = `<a href="${asset.url}" target="_blank" rel="noopener noreferrer">${asset.name}</a>`;
    }
    navigator.clipboard.writeText(embed);
    addToast('success', 'Embed Code Copied', 'HTML embed snippet copied to clipboard.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono text-xs font-bold rounded-lg uppercase tracking-wider">
              WordPress Media Manager
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              {mediaAssets.length} total assets
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Media Library & Assets Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Upload images, videos, audio tracks, and documents. Link media assets directly to Categories/Tags and Content items, or copy embed codes for your posts.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>Upload / Add Media Asset</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets by name or caption..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Media Types ({mediaAssets.length})</option>
              <option value="image">Images ({mediaAssets.filter(a => a.type === 'image').length})</option>
              <option value="video">Videos ({mediaAssets.filter(a => a.type === 'video').length})</option>
              <option value="audio">Audio Tracks ({mediaAssets.filter(a => a.type === 'audio').length})</option>
              <option value="document">Documents ({mediaAssets.filter(a => a.type === 'document').length})</option>
            </select>
          </div>

          {/* Tag / Category Filter */}
          <div>
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="all">Filter by Tag / Category (All)</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  🏷️ {t.name} ({t.type})
                </option>
              ))}
            </select>
          </div>

          {/* Content Item Filter */}
          <div>
            <select
              value={selectedContentFilter}
              onChange={(e) => setSelectedContentFilter(e.target.value)}
              className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
            >
              <option value="all">Filter by Content Item (All)</option>
              {content.map((c) => (
                <option key={c.id} value={c.id}>
                  📄 {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Media Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center">
          <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No media assets found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try adjusting your search criteria or upload a new media file.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const linkedTags = tags.filter((t) => asset.linkedTagIds?.includes(t.id));
            const linkedContents = content.filter((c) => asset.linkedContentIds?.includes(c.id));

            return (
              <div
                key={asset.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col group"
              >
                {/* Thumbnail Display */}
                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                  {asset.type === 'image' ? (
                    <img
                      src={`${BASE_API_URL}/${asset.url}`}
                      alt={asset.altText || asset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : asset.type === 'video' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-rose-400 p-3 text-center">
                      <Video className="w-10 h-10 mb-1" />
                      <span className="text-[11px] text-slate-300 font-mono">Video Embed</span>
                    </div>
                  ) : asset.type === 'audio' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-purple-400 p-3 text-center">
                      <Music className="w-10 h-10 mb-1" />
                      <span className="text-[11px] text-slate-300 font-mono">Audio Track</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                      <FileText className="w-10 h-10" />
                    </div>
                  )}

                  {/* Badge */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {asset.type}
                  </span>

                  {/* Quick Action Overlay */}
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      onClick={() => setPreviewMedia(asset)}
                      className="p-2 bg-white text-slate-900 rounded-xl hover:bg-slate-100 transition shadow cursor-pointer"
                      title="Preview Media"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyEmbedCode(asset)}
                      className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow cursor-pointer"
                      title="Copy HTML Embed Code"
                    >
                      <FileCode className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCopyLink(asset.url)}
                      className="p-2 bg-slate-800 text-slate-200 rounded-xl hover:bg-slate-700 transition shadow cursor-pointer"
                      title="Copy Direct URL"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Info Container */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1" title={asset.name}>
                      {asset.name}
                    </h3>
                    {asset.caption && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {asset.caption}
                      </p>
                    )}
                  </div>

                  {/* Linked Tags & Content Badges */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
                    {/* Linked Tags/Categories */}
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <TagIcon className="w-3 h-3 text-amber-500" />
                        <span>Tags:</span>
                      </span>
                      {linkedTags.length > 0 ? (
                        linkedTags.map((t) => (
                          <span
                            key={t.id}
                            className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-medium"
                          >
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </div>

                    {/* Linked Content Items */}
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      <span className="text-slate-400 font-semibold flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-blue-500" />
                        <span>Linked:</span>
                      </span>
                      {linkedContents.length > 0 ? (
                        linkedContents.map((c) => (
                          <span
                            key={c.id}
                            className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded font-medium truncate max-w-[120px]"
                            title={c.title}
                          >
                            {c.title}
                          </span>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <button
                      onClick={() => setEditingMedia(asset)}
                      className="px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </button>

                    <button
                      onClick={() => deleteMediaAsset(asset.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition cursor-pointer"
                      title="Delete Media Asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Media Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-500" />
              <span>Upload or Add Media Asset</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Add new images, video embeds, or audio tracks to link with your CMS categories and content.
            </p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                <label className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg cursor-pointer inline-block transition">
                  Choose Local File
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf"
                    className="hidden"
                    onChange={handleFileUploadSimulated}
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Asset Title / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Header Image or Course Video"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Media Direct URL / Embed Link
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/... or YouTube Embed URL"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MediaType)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="document">Document</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    placeholder="Image description"
                    value={newAltText}
                    onChange={(e) => setNewAltText(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link to Tags / Categories
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {tags.map((t) => {
                    const isChecked = newTagIds.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          if (isChecked) setNewTagIds((prev) => prev.filter((id) => id !== t.id));
                          else setNewTagIds((prev) => [...prev, t.id]);
                        }}
                        className={`px-2 py-1 text-[10px] rounded-lg font-medium cursor-pointer ${
                          isChecked ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Link to Content Item
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {content.map((c) => {
                    const isChecked = newContentIds.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          if (isChecked) setNewContentIds((prev) => prev.filter((id) => id !== c.id));
                          else setNewContentIds((prev) => [...prev, c.id]);
                        }}
                        className={`px-2 py-1 text-[10px] rounded-lg font-medium cursor-pointer ${
                          isChecked ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {c.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                >
                  Save Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Media Modal */}
      {editingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-500" />
              <span>Manage Media Asset & Relations</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingMedia.name}
                  onChange={(e) => setEditingMedia({ ...editingMedia, name: e.target.value })}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Media URL
                </label>
                <input
                  type="text"
                  value={editingMedia.url}
                  onChange={(e) => setEditingMedia({ ...editingMedia, url: e.target.value })}
                  className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Linked Tags / Categories
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {tags.map((t) => {
                    const isLinked = editingMedia.linkedTagIds?.includes(t.id);
                    return (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => {
                          if (isLinked) {
                            unlinkMediaFromTag(editingMedia.id, t.id);
                            setEditingMedia({
                              ...editingMedia,
                              linkedTagIds: editingMedia.linkedTagIds.filter((id) => id !== t.id),
                            });
                          } else {
                            linkMediaToTag(editingMedia.id, t.id);
                            setEditingMedia({
                              ...editingMedia,
                              linkedTagIds: [...(editingMedia.linkedTagIds || []), t.id],
                            });
                          }
                        }}
                        className={`px-2 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                          isLinked ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isLinked && <Check className="w-3 h-3" />}
                        <span>{t.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Linked Content Items
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {content.map((c) => {
                    const isLinked = editingMedia.linkedContentIds?.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => {
                          if (isLinked) {
                            unlinkMediaFromContent(editingMedia.id, c.id);
                            setEditingMedia({
                              ...editingMedia,
                              linkedContentIds: editingMedia.linkedContentIds.filter((id) => id !== c.id),
                            });
                          } else {
                            linkMediaToContent(editingMedia.id, c.id);
                            setEditingMedia({
                              ...editingMedia,
                              linkedContentIds: [...(editingMedia.linkedContentIds || []), c.id],
                            });
                          }
                        }}
                        className={`px-2 py-1 text-[10px] rounded-lg font-bold flex items-center gap-1 cursor-pointer ${
                          isLinked ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {isLinked && <Check className="w-3 h-3" />}
                        <span>{c.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateMediaAsset(editingMedia.id, editingMedia);
                    setEditingMedia(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {previewMedia.name}
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Close Preview
              </button>
            </div>

            <div className="max-h-[60vh] flex items-center justify-center bg-slate-950 rounded-xl overflow-hidden p-2">
              {previewMedia.type === 'image' ? (
                <img src={previewMedia.url} alt={previewMedia.name} className="max-h-[55vh] object-contain rounded-lg" />
              ) : previewMedia.type === 'video' ? (
                <iframe src={previewMedia.url} className="w-full h-80 rounded-lg" title={previewMedia.name} allowFullScreen />
              ) : previewMedia.type === 'audio' ? (
                <audio controls src={previewMedia.url} className="w-full" />
              ) : (
                <div className="text-white text-center py-10">
                  <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                  <p>{previewMedia.name}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Direct Link: <code className="text-blue-500">{previewMedia.url}</code></span>
              <button
                onClick={() => handleCopyEmbedCode(previewMedia)}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg"
              >
                Copy Embed Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
