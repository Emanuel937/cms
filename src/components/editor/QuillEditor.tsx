import React, { useState, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Image as ImageIcon, Video as VideoIcon, Sparkles, 
  FolderPlus, Maximize2, Minimize2, Type, FileCode 
} from 'lucide-react';
import { MediaPickerModal } from '../common/MediaPickerModal';
import { MediaAsset } from '../../types/cms';

interface QuillEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
  showMediaPickerButton?: boolean;
}

const ReactQuillComponent = ReactQuill as unknown as React.ComponentType<any>;

export const QuillEditor: React.FC<QuillEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write rich content with headings, lists, quotes, images, videos...',
  readOnly = false,
  minHeight = '320px',
  className = '',
  showMediaPickerButton = true,
}) => {
  const quillRef = useRef<ReactQuill | null>(null);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Custom Quill Toolbar configuration with rich options
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, 4, false] }, { font: [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  // Word and character count calculation
  const cleanText = useMemo(() => {
    if (!value) return '';
    return value.replace(/<[^>]*>?/gm, '').trim();
  }, [value]);

  const wordCount = useMemo(() => {
    if (!cleanText) return 0;
    return cleanText.split(/\s+/).filter(Boolean).length;
  }, [cleanText]);

  const charCount = cleanText.length;

  // Insert selected media item into Quill editor body at current selection index
  const handleInsertMedia = (media: MediaAsset) => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };

    if (media.type === 'image') {
      editor.insertEmbed(range.index, 'image', media.url);
      editor.setSelection(range.index + 1, 0);
    } else if (media.type === 'video') {
      editor.insertEmbed(range.index, 'video', media.url);
      editor.setSelection(range.index + 1, 0);
    } else if (media.type === 'audio') {
      // Insert audio HTML snippet or link
      const audioHtml = `<audio controls src="${media.url}" class="w-full my-2"></audio>`;
      editor.clipboard.dangerouslyPasteHTML(range.index, audioHtml);
    } else {
      // Insert Link
      editor.insertText(range.index, media.name, 'link', media.url);
    }
  };

  return (
    <div
      className={`relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm transition-all overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl max-h-[92vh]' : ''
      } ${className}`}
    >
      {/* Editor Header Bar */}
      <div className="px-4 py-2 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-blue-500" />
            <span>Quill WYSIWYG Editor</span>
          </span>
          <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-mono px-2 py-0.5 rounded-full font-bold">
            Rich Text Format
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showMediaPickerButton && (
            <button
              type="button"
              onClick={() => setIsMediaModalOpen(true)}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              title="Open Media Library to insert image or video"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Media Library</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Quill Wrapper */}
      <div
        className="flex-1 overflow-y-auto quill-editor-container dark:text-slate-100 text-slate-900"
        style={{ minHeight }}
      >
        <ReactQuillComponent
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={readOnly}
          className="h-full border-none text-slate-900 dark:text-slate-100"
        />
      </div>

      {/* Footer Word/Char Counter */}
      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-3 font-mono">
          <span>Words: <strong className="text-slate-700 dark:text-slate-200">{wordCount}</strong></span>
          <span>Chars: <strong className="text-slate-700 dark:text-slate-200">{charCount}</strong></span>
        </div>
        <div className="text-[10px] text-slate-400 italic">
          Supports HTML formatting, image & video embeds
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectMedia={handleInsertMedia}
        title="Insert Media Asset into Editor"
      />
    </div>
  );
};
