import React, { useState } from 'react';
import { 
  X, Image as ImageIcon, Video, FileText, Music, 
  Search, Plus, Check, Link2, Upload, Tag as TagIcon 
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { MediaAsset, MediaType } from '../../types/cms';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMedia: (media: MediaAsset, insertFormat: 'embed' | 'url' | 'tag') => void;
  allowedTypes?: MediaType[];
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectMedia,
  allowedTypes = ['image', 'video', 'document', 'audio'],
  title = 'Media Library & Asset Picker',
}) => {
  const { mediaAssets, addMediaAsset, tags, content } = useCMS();
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  // New Upload Form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState<MediaType>('image');
  const [newCaption, setNewCaption] = useState('');
  const [newAltText, setNewAltText] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedContentIds, setSelectedContentIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const filteredAssets = mediaAssets.filter((asset) => {
    if (allowedTypes && !allowedTypes.includes(asset.type)) return false;
    if (selectedType !== 'all' && asset.type !== selectedType) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = asset.name.toLowerCase().includes(q);
      const matchCap = asset.caption?.toLowerCase().includes(q) || false;
      return matchName || matchCap;
    }
    return true;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;

    addMediaAsset({
      name: newName,
      url: newUrl,
      type: newType,
      size: '1.2 MB',
      dimensions: newType === 'image' ? '1920x1080' : 'HD',
      caption: newCaption,
      altText: newAltText || newName,
      linkedTagIds: selectedTagIds,
      linkedContentIds: selectedContentIds,
    });

    // Reset Form & Switch to Library
    setNewName('');
    setNewUrl('');
    setNewCaption('');
    setNewAltText('');
    setSelectedTagIds([]);
    setSelectedContentIds([]);
    setActiveTab('library');
  };

  const handleFileUploadSimulated = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-500" />
              <span>{title}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select or upload images, videos, and media assets to link or insert into content.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab & Controls Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Media Library ({mediaAssets.length})
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload / Add Media</span>
            </button>
          </div>

          {activeTab === 'library' && (
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search media files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="py-1.5 px-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none text-slate-700 dark:text-slate-300"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="audio">Audio</option>
                <option value="document">Documents</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-950/40">
          {activeTab === 'library' ? (
            filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
                <ImageIcon className="w-12 h-12 mb-3 stroke-[1.5] text-slate-300 dark:text-slate-700" />
                <p className="font-semibold text-sm">No media files found</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search filter or upload a new image/video asset.
                </p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition"
                >
                  Upload First Media File
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`group relative bg-white dark:bg-slate-900 border rounded-xl overflow-hidden cursor-pointer transition-all duration-200 shadow-sm ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      {/* Media Thumbnail Container */}
                      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative flex items-center justify-center overflow-hidden">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt={asset.altText || asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : asset.type === 'video' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-rose-400 p-2 text-center">
                            <Video className="w-8 h-8 mb-1" />
                            <span className="text-[10px] text-slate-300 font-mono truncate max-w-full px-1">
                              Video Embed
                            </span>
                          </div>
                        ) : asset.type === 'audio' ? (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-purple-400 p-2 text-center">
                            <Music className="w-8 h-8 mb-1" />
                            <span className="text-[10px] text-slate-300 font-mono">Audio Track</span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
                            <FileText className="w-8 h-8" />
                          </div>
                        )}

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}

                        {/* Type Badge */}
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase tracking-wider">
                          {asset.type}
                        </span>
                      </div>

                      {/* Info Footer */}
                      <div className="p-2.5">
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200 truncate" title={asset.name}>
                          {asset.name}
                        </h4>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                          <span>{asset.size}</span>
                          <span>{asset.dimensions}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            /* Upload Tab */
            <form onSubmit={handleUploadSubmit} className="max-w-xl mx-auto space-y-4 py-2">
              <div className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-900 text-center relative hover:border-blue-500 dark:hover:border-blue-500 transition">
                <Upload className="w-10 h-10 text-blue-500 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                  Select Local File or Enter Direct URL
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-3">
                  Upload images, MP4 videos, or link external media assets.
                </p>
                <label className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer inline-block transition shadow-sm">
                  Choose Local File
                  <input
                    type="file"
                    accept="image/*,video/*,audio/*,.pdf"
                    className="hidden"
                    onChange={handleFileUploadSimulated}
                  />
                </label>
              </div>

              <div className="space-y-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Media Title / Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Hero Banner 2026 or Course Introduction Video"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Media URL / Embed Link
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash.com/... or https://www.youtube.com/embed/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Media Type
                    </label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as MediaType)}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none text-slate-800 dark:text-slate-200"
                    >
                      <option value="image">Image Asset</option>
                      <option value="video">Video Embed / MP4</option>
                      <option value="audio">Audio MP3 Track</option>
                      <option value="document">PDF / Document</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      placeholder="Accessibility description"
                      value={newAltText}
                      onChange={(e) => setNewAltText(e.target.value)}
                      className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Caption / Summary
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional media caption..."
                    value={newCaption}
                    onChange={(e) => setNewCaption(e.target.value)}
                    className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Tag & Category Linking */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <TagIcon className="w-3.5 h-3.5 text-amber-500" />
                    <span>Link to Categories / Tags</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    {tags.map((t) => {
                      const isChecked = selectedTagIds.includes(t.id);
                      return (
                        <button
                          type="button"
                          key={t.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedTagIds((prev) => prev.filter((id) => id !== t.id));
                            } else {
                              setSelectedTagIds((prev) => [...prev, t.id]);
                            }
                          }}
                          className={`px-2 py-1 text-[11px] rounded-lg transition font-medium flex items-center gap-1 cursor-pointer ${
                            isChecked
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                          <span>{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save to Media Library</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {activeTab === 'library' && (
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
            <div className="text-xs text-slate-500 truncate max-w-sm">
              {selectedAsset ? (
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Selected: {selectedAsset.name} ({selectedAsset.type})
                </span>
              ) : (
                <span>Select a media asset from above</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!selectedAsset}
                onClick={() => {
                  if (selectedAsset) {
                    onSelectMedia(selectedAsset, 'embed');
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Insert Selected Media</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
