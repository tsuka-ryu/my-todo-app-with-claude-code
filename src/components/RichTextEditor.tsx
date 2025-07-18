'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { prepareContentForEditor, prepareContentForStorage } from '@/lib/markdown';
import { markdownInputHandler } from '@/lib/markdownInputHandler';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [editorContent, setEditorContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        hardBreak: {
          keepMarks: false,
          HTMLAttributes: {
            class: 'hard-break',
          },
        },
      }),
    ],
    content: editorContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = prepareContentForStorage(html);
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-3 min-h-[500px] dark:prose-invert text-gray-900 dark:text-gray-100',
      },
      handleKeyDown: (view, event) => {
        // 見出しから改行した時に通常の段落に戻る
        if (event.key === 'Enter' && !event.shiftKey) {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          
          // 現在が見出しかチェック
          if ($from.parent.type.name === 'heading') {
            // 見出し内でEnterを押したら、見出しを解除して通常の段落に
            setTimeout(() => {
              const editorElement = view.dom.closest('[data-tiptap-editor]') as HTMLElement & { __tiptapEditor?: typeof editor };
              const editorInstance = editorElement?.__tiptapEditor;
              if (editorInstance) {
                editorInstance.chain().focus().setParagraph().run();
              }
            }, 0);
          }
        }
        
        // マークダウン記法の処理
        return markdownInputHandler(view as Parameters<typeof markdownInputHandler>[0], event);
      },
    },
  });

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const htmlContent = await prepareContentForEditor(content);
        setEditorContent(htmlContent);
        if (editor && htmlContent !== editor.getHTML()) {
          editor.commands.setContent(htmlContent);
        }
      } catch (error) {
        console.error('Content conversion failed:', error);
        setEditorContent(content);
        if (editor) {
          editor.commands.setContent(content);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [content, editor]);

  if (!editor || isLoading) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[550px] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
      {/* ツールバー */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-t-lg">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="太字"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="斜体"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('strike') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="取り消し線"
        >
          <s>S</s>
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="見出し1"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="見出し2"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('heading', { level: 3 }) ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="見出し3"
        >
          H3
        </button>
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('paragraph') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="段落"
        >
          P
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="箇条書き"
        >
          • リスト
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 ${
            editor.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-600' : ''
          }`}
          title="番号付きリスト"
        >
          1. リスト
        </button>
      </div>
      
      {/* エディター */}
      <div 
        data-tiptap-editor 
        ref={(el) => { 
          if (el && editor) {
            (el as unknown as { __tiptapEditor: typeof editor }).__tiptapEditor = editor;
          }
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}