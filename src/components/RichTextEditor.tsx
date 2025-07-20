'use client';

import { useEffect, useState, useMemo } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/react/style.css';
import '@blocknote/mantine/style.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [isLoading, setIsLoading] = useState(true);

  const editor = useMemo(() => {
    return BlockNoteEditor.create({
      initialContent: [],
    });
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        if (content && content.trim()) {
          const blocks = await editor.tryParseMarkdownToBlocks(content);
          editor.replaceBlocks(editor.document, blocks);
        } else {
          editor.replaceBlocks(editor.document, []);
        }
      } catch (error) {
        console.error('Content conversion failed:', error);
        editor.replaceBlocks(editor.document, []);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [content, editor]);

  useEffect(() => {
    const handleChange = async () => {
      try {
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        onChange(markdown);
      } catch (error) {
        console.error('Failed to convert to markdown:', error);
      }
    };

    editor.onChange(handleChange);
  }, [editor, onChange]);

  if (isLoading) {
    return (
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[550px] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 min-h-[550px]">
      <BlockNoteView 
        editor={editor} 
        theme="light"
        data-theming-css-variables-demo
      />
    </div>
  );
}