import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Eye, Code, Layout, Save, Check, Plus, Image as ImageIcon, Video as VideoIcon, Type,
  Link as LinkIcon, Bold, Italic, List, ListOrdered, Quote, Code as CodeIcon, 
  AlignLeft, AlignCenter, AlignRight, Tag as TagIcon, Settings, Calendar, 
  User, Shield, Sparkles, Layers, FileText, ChevronDown, ChevronRight, X, Trash2, Heading
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { EnrichedContent, ContentType, Tag } from '../../types/cms';
import { QuillEditor } from './QuillEditor';

interface WordPressEditorProps {
  contentItem: EnrichedContent;
  onClose: () => void;
}

export const WordPressEditor: React.FC<WordPressEditorProps> = ({ contentItem, onClose }) => {
  const { 
    updateContent, tags, addTag, setTagsForContent, 
    addContentMeta, deleteContentMeta, addToast, currentUser 
  } = useCMS();

  // Local Editor State
  const [title, setTitle] = useState(contentItem.title);
  const [body, setBody] = useState(contentItem.body);
  const [type, setType] = useState<ContentType>(contentItem.type);
  const [status, setStatus] = useState<'published' | 'draft'>('published');
  const [slug, setSlug] = useState(
    contentItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `content-${contentItem.id}`
  );
  
  // View mode: 'visual' (WYSIWYG layout), 'code' (raw Markdown/HTML), 'preview' (Frontend view)
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'preview'>('visual');
  const [showBlockInserter, setShowBlockInserter] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Inspector Accordion sections
  const [openSection, setOpenSection] = useState<'status' | 'tags' | 'featured' | 'meta' | 'excerpt'>('status');

  // Featured Image Meta key check
  const existingFeaturedImageMeta = contentItem.meta.find((m) => m.key === 'featured_image' || m.key === 'image');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(existingFeaturedImageMeta?.value || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80');

  // Excerpt state
  const existingExcerptMeta = contentItem.meta.find((m) => m.key === 'excerpt');
  const [excerpt, setExcerpt] = useState(existingExcerptMeta?.value || 'Comprehensive guide to building scalable full-stack applications with React and Node.');

  // Attached Tags
  const [attachedTagIds, setAttachedTagIds] = useState<string[]>(contentItem.tags.map((t) => t.id));

  // Custom Meta Pairs
  const [customMetaList, setCustomMetaList] = useState(contentItem.meta);
  const [newMetaKey, setNewMetaKey] = useState('');
  const [newMetaValue, setNewMetaValue] = useState('');

  // Save handler
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    updateContent(contentItem.id, {
      title,
      body,
      type,
    });
    setTagsForContent(contentItem.id, attachedTagIds);
    
    setTimeout(() => {
      setIsSaving(false);
      addToast('success', 'Post Updated', `"${title}" saved successfully.`);
    }, 300);
  };

  // Text insertion helpers for formatting bar
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('wp-content-textarea') as HTMLTextAreaElement;
    if (!textarea) {
      setBody((prev) => `${prev}\n${prefix}text${suffix}`);
      return;
    }
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end) || 'formatted text';
    const newText = body.substring(0, start) + prefix + selectedText + suffix + body.substring(end);
    setBody(newText);
  };

  const insertBlock = (type: 'paragraph' | 'heading' | 'quote' | 'code' | 'image' | 'video' | 'list' | 'alert') => {
    let blockSnippet = '';
    switch (type) {
      case 'paragraph':
        blockSnippet = '\n\nThis is a new paragraph block in WordPress Gutenberg editor. You can write rich text, link resources, and format typography effortlessly.\n';
        break;
      case 'heading':
        blockSnippet = '\n\n## New Heading Section\n';
        break;
      case 'quote':
        blockSnippet = '\n\n> "Inspiration exists, but it has to find you working." — Pablo Picasso\n';
        break;
      case 'code':
        blockSnippet = '\n\n```typescript\n// Example Code Block\nfunction helloWorld(): string {\n  return "Hello from WordPress Block Editor!";\n}\n```\n';
        break;
      case 'image':
        const imgUrl = prompt('Enter Image URL (Unsplash or direct image):', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80') || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';
        blockSnippet = `\n\n![WordPress Media Image](${imgUrl})\n*Caption: High-resolution media asset*\n`;
        break;
      case 'video':
        const videoUrl = prompt('Enter YouTube or MP4 Video Embed URL:', 'https://www.youtube.com/embed/dQw4w9WgXcQ') || 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        blockSnippet = `\n\n<iframe width="100%" height="380" src="${videoUrl}" title="WordPress Embedded Video Player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen className="rounded-xl my-4"></iframe>\n`;
        break;
      case 'list':
        blockSnippet = '\n\n- Key Feature One\n- Key Feature Two\n- Key Feature Three\n';
        break;
      case 'alert':
        blockSnippet = '\n\n:::info\n💡 Pro Tip: Custom fields allow extending content meta with key-value pairs.\n:::\n';
        break;
    }
    setBody((prev) => prev + blockSnippet);
    setShowBlockInserter(false);
  };

  // Add metadata key-value
  const handleAddMeta = () => {
    if (!newMetaKey || !newMetaValue) return;
    addContentMeta({
      content_id: contentItem.id,
      key: newMetaKey,
      value: newMetaValue,
    });
    setCustomMetaList((prev) => [
      ...prev,
      { id: `meta_${Date.now()}`, content_id: contentItem.id, key: newMetaKey, value: newMetaValue },
    ]);
    setNewMetaKey('');
    setNewMetaValue('');
  };

  // Word count stats
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;
  const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="fixed inset-0 z-50 bg-[#F0F0F1] dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 flex flex-col overflow-hidden font-sans">
      
      {/* WORDPRESS HEADER TOOLBAR */}
      <header className="h-14 bg-[#1D2327] text-white flex items-center justify-between px-4 border-b border-slate-800 shrink-0 select-none">
        {/* Left: Back & Gutenberg Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Return to Content Manager"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Close Editor</span>
          </button>

          <div className="h-4 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#3858E9] flex items-center justify-center font-extrabold text-[11px] text-white shadow-sm">
              WP
            </div>
            <span className="font-bold text-xs tracking-tight text-slate-200 hidden md:inline">
              WordPress Visual Block Editor
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700">
              ID: {contentItem.id}
            </span>
          </div>
        </div>

        {/* Center: View Mode Switcher */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-lg border border-slate-700/80 text-xs font-medium">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === 'visual'
                ? 'bg-[#3858E9] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Visual Block</span>
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === 'code'
                ? 'bg-[#3858E9] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Source Code</span>
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              viewMode === 'preview'
                ? 'bg-[#3858E9] text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-1.5 rounded-lg border transition-colors ${
              sidebarOpen
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-transparent border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="Toggle Document Inspector Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#2271B1] hover:bg-[#135E96] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Update Post</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* SECONDARY GUTENBERG FORMATTING TOOLBAR (When in Visual / Code Mode) */}
      {viewMode !== 'preview' && (
        <div className="h-11 bg-white dark:bg-slate-900 border-b border-[#E2E8F0] dark:border-slate-800 px-4 flex items-center justify-between shrink-0 overflow-x-auto shadow-xs">
          <div className="flex items-center gap-1">
            {/* Block Inserter Button */}
            <div className="relative">
              <button
                onClick={() => setShowBlockInserter(!showBlockInserter)}
                className="flex items-center gap-1 px-2.5 py-1 bg-[#2271B1] hover:bg-[#135E96] text-white rounded-md text-xs font-bold shadow-xs transition-all mr-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Block</span>
              </button>

              {/* Inserter Popup Menu */}
              {showBlockInserter && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowBlockInserter(false)} />
                  <div className="absolute left-0 top-9 z-30 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-2 space-y-1 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                      WordPress Content Blocks
                    </div>
                    <button
                      onClick={() => insertBlock('paragraph')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Type className="w-4 h-4 text-blue-500" />
                      <span>Paragraph Block</span>
                    </button>
                    <button
                      onClick={() => insertBlock('heading')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Heading className="w-4 h-4 text-indigo-500" />
                      <span>Heading Block (H2)</span>
                    </button>
                    <button
                      onClick={() => insertBlock('image')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span>Image / Media Block</span>
                    </button>
                    <button
                      onClick={() => insertBlock('video')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <VideoIcon className="w-4 h-4 text-rose-500" />
                      <span>Video Embed Block</span>
                    </button>
                    <button
                      onClick={() => insertBlock('quote')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Quote className="w-4 h-4 text-purple-500" />
                      <span>Blockquote</span>
                    </button>
                    <button
                      onClick={() => insertBlock('code')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <CodeIcon className="w-4 h-4 text-emerald-500" />
                      <span>Syntax Code Snippet</span>
                    </button>
                    <button
                      onClick={() => insertBlock('list')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <List className="w-4 h-4 text-cyan-500" />
                      <span>Bulleted List</span>
                    </button>
                    <button
                      onClick={() => insertBlock('alert')}
                      className="w-full flex items-center gap-2 px-2.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Callout Banner</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* Quick formatting tools */}
            <button
              onClick={() => insertFormatting('**', '**')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('<u>', '</u>')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold underline"
              title="Underline"
            >
              U
            </button>
            <button
              onClick={() => insertFormatting('~~', '~~')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold line-through"
              title="Strikethrough"
            >
              S
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              onClick={() => insertFormatting('\n# ')}
              className="px-2 py-1 text-xs font-black rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => insertFormatting('\n## ')}
              className="px-2 py-1 text-xs font-black rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => insertFormatting('\n### ')}
              className="px-2 py-1 text-xs font-black rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              title="Heading 3"
            >
              H3
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              onClick={() => insertFormatting('\n- ')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Bullet list"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('\n1. ')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Numbered list"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('\n> ')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Quote block"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertFormatting('`', '`')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Inline code (`code`)"
            >
              <CodeIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                const url = prompt('Enter URL link address:');
                if (url) insertFormatting(`[${url}](`, `)`);
              }}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              title="Insert Link"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-[#64748B] dark:text-slate-400 font-mono flex items-center gap-3">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} chars</span>
            <span>•</span>
            <span>~{readTimeMin} min read</span>
          </div>
        </div>
      )}

      {/* MAIN EDITOR WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* CANVAS WORKSPACE (Left/Center) */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center">
          <div className="w-full max-w-3xl space-y-6 bg-white dark:bg-slate-900 p-6 md:p-10 rounded-xl border border-[#E2E8F0] dark:border-slate-800 shadow-sm transition-all h-fit">
            
            {/* Title Block */}
            <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Add post title..."
                className="w-full text-2xl md:text-3xl font-extrabold text-[#1E293B] dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-700 bg-transparent focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors py-1"
              />
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>Permalink: http://cms-admin.local/posts/<strong>{slug}</strong></span>
              </div>
            </div>

            {/* Featured Image Canvas Banner */}
            {featuredImageUrl && (
              <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 max-h-64 group">
                <img
                  src={featuredImageUrl}
                  alt="Featured Header"
                  className="w-full h-48 md:h-64 object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                  Featured Media
                </div>
              </div>
            )}

            {/* VISUAL BLOCK MODE */}
            {viewMode === 'visual' && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Rich Body Content (Quill WYSIWYG & Media Library)
                </label>
                <QuillEditor
                  value={body}
                  onChange={setBody}
                  minHeight="380px"
                  placeholder="Write rich post content, insert headings, quotes, or pick images and videos from the Media Library..."
                />
              </div>
            )}

            {/* SOURCE CODE MODE */}
            {viewMode === 'code' && (
              <div className="space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                  <span>HTML / Markdown Source View</span>
                  <span>UTF-8 Document</span>
                </div>
                <textarea
                  rows={18}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full p-4 text-xs font-mono bg-slate-900 text-emerald-400 rounded-lg border border-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>
            )}

            {/* LIVE FRONTEND PREVIEW MODE */}
            {viewMode === 'preview' && (
              <div className="space-y-6 pt-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                  <span>🌐 Live Blog Article Preview (How readers experience this item)</span>
                  <span className="font-mono text-[10px] bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded font-bold">FRONTEND</span>
                </div>

                <article className="prose dark:prose-invert max-w-none space-y-4">
                  <h1 className="text-3xl font-extrabold text-[#1E293B] dark:text-slate-100 leading-tight">
                    {title}
                  </h1>
                  
                  <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser?.email || 'WordPress Admin'}</span>
                    <span>•</span>
                    <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-bold">{type}</span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                    {body}
                  </p>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-1.5">
                    {attachedTagIds.map((tid) => {
                      const t = tags.find((item) => item.id === tid);
                      return t ? (
                        <span key={t.id} className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                          #{t.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </article>
              </div>
            )}

          </div>
        </div>

        {/* DOCUMENT INSPECTOR SIDEBAR (Right Column) */}
        {sidebarOpen && (
          <aside className="w-80 bg-white dark:bg-slate-900 border-l border-[#E2E8F0] dark:border-slate-800 flex flex-col shrink-0 overflow-y-auto text-xs select-none">
            
            {/* Inspector Header */}
            <div className="p-3.5 border-b border-[#E2E8F0] dark:border-slate-800 font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between bg-[#F8FAFC] dark:bg-slate-800/50">
              <span className="flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-[#2271B1]" />
                Post Settings & Inspector
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Accordion 1: Status & Visibility */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setOpenSection(openSection === 'status' ? '' as any : 'status')}
                className="w-full p-3.5 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span>Status & Visibility</span>
                {openSection === 'status' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {openSection === 'status' && (
                <div className="p-3.5 pt-0 space-y-3 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Visibility:</span>
                    <span className="font-bold text-[#2271B1]">Public</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Publish Status:</span>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Content Type:</span>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as ContentType)}
                      className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold text-slate-900 dark:text-slate-100 capitalize"
                    >
                      <option value="article">Article</option>
                      <option value="course">Course</option>
                      <option value="lesson">Lesson</option>
                      <option value="quiz">Quiz</option>
                      <option value="page">Page</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span>Author:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {currentUser?.email || 'Admin'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Categories & Tags */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setOpenSection(openSection === 'tags' ? '' as any : 'tags')}
                className="w-full p-3.5 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span>Categories & Taxonomy</span>
                {openSection === 'tags' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {openSection === 'tags' && (
                <div className="p-3.5 pt-0 space-y-2">
                  <p className="text-[11px] text-slate-400">Select tags from ContentTag table:</p>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800">
                    {tags.map((t) => {
                      const isChecked = attachedTagIds.includes(t.id);
                      return (
                        <label key={t.id} className="flex items-center gap-2 text-xs font-medium cursor-pointer text-slate-700 dark:text-slate-300 hover:text-blue-600">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAttachedTagIds([...attachedTagIds, t.id]);
                              } else {
                                setAttachedTagIds(attachedTagIds.filter((id) => id !== t.id));
                              }
                            }}
                            className="rounded border-slate-300 text-[#2271B1] focus:ring-[#2271B1]"
                          />
                          <span className="truncate">{t.name}</span>
                          <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500 font-mono ml-auto shrink-0">
                            {t.type}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Featured Image */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setOpenSection(openSection === 'featured' ? '' as any : 'featured')}
                className="w-full p-3.5 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span>Featured Image</span>
                {openSection === 'featured' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {openSection === 'featured' && (
                <div className="p-3.5 pt-0 space-y-2">
                  <label className="block text-[11px] text-slate-400">Image URL:</label>
                  <input
                    type="text"
                    value={featuredImageUrl}
                    onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs"
                  />
                  {featuredImageUrl && (
                    <div className="relative rounded overflow-hidden border border-slate-200 dark:border-slate-700 mt-2">
                      <img src={featuredImageUrl} alt="Preview" className="w-full h-28 object-cover" />
                      <button
                        onClick={() => setFeaturedImageUrl('')}
                        className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded text-[10px] font-bold shadow-xs"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Accordion 4: Excerpt */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setOpenSection(openSection === 'excerpt' ? '' as any : 'excerpt')}
                className="w-full p-3.5 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span>Post Excerpt</span>
                {openSection === 'excerpt' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {openSection === 'excerpt' && (
                <div className="p-3.5 pt-0 space-y-2">
                  <textarea
                    rows={3}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Write a brief excerpt..."
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded"
                  />
                  <p className="text-[10px] text-slate-400">Excerpts are optional hand-crafted summaries of your content.</p>
                </div>
              )}
            </div>

            {/* Accordion 5: Custom Fields (ContentMeta) */}
            <div className="border-b border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setOpenSection(openSection === 'meta' ? '' as any : 'meta')}
                className="w-full p-3.5 flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span>Custom Fields (ContentMeta)</span>
                {openSection === 'meta' ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>

              {openSection === 'meta' && (
                <div className="p-3.5 pt-0 space-y-3">
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {customMetaList.map((m) => (
                      <div key={m.id} className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] font-mono">
                        <div className="truncate pr-1">
                          <strong className="text-blue-600 dark:text-blue-400">{m.key}:</strong> {m.value}
                        </div>
                        <button
                          onClick={() => {
                            deleteContentMeta(m.id);
                            setCustomMetaList(customMetaList.filter((item) => item.id !== m.id));
                          }}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <input
                      type="text"
                      placeholder="Meta key (e.g. read_time)"
                      value={newMetaKey}
                      onChange={(e) => setNewMetaKey(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={newMetaValue}
                      onChange={(e) => setNewMetaValue(e.target.value)}
                      className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs font-mono"
                    />
                    <button
                      onClick={handleAddMeta}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold text-xs"
                    >
                      + Add Custom Field
                    </button>
                  </div>
                </div>
              )}
            </div>

          </aside>
        )}

      </div>
    </div>
  );
};
