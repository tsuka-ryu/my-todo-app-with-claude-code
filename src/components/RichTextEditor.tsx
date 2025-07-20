'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
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
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [localContent, setLocalContent] = useState(content);

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark');
      console.log('RichTextEditor isDark:', isDark);
      setIsDarkMode(isDark);
    };

    checkDarkMode();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const observer = new MutationObserver(checkDarkMode);
    
    mediaQuery.addEventListener('change', checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      mediaQuery.removeEventListener('change', checkDarkMode);
      observer.disconnect();
    };
  }, []);

  const handleContentChange = useCallback(async (editor: BlockNoteEditor) => {
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      setLocalContent(markdown);
    } catch (error) {
      console.error('Failed to convert to markdown:', error);
    }
  }, []);

  const editor = useMemo(() => {
    return BlockNoteEditor.create();
  }, []);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        if (content && content.trim()) {
          const blocks = await editor.tryParseMarkdownToBlocks(content);
          if (blocks && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
          }
        }
      } catch (error) {
        console.error('Content loading failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [content, editor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localContent);
    }, 500);

    return () => clearTimeout(timer);
  }, [localContent, onChange]);


  if (isLoading) {
    return (
      <div className="min-h-[550px] flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[550px]"
      style={{
        '--editor-text-color': isDarkMode ? '#e5e7eb' : '#000000'
      } as React.CSSProperties}
      data-dark-mode={isDarkMode}
    >
      <style jsx>{`
        :global([data-theming-css-variables-demo] .bn-editor),
        :global([data-theming-css-variables-demo] .bn-block-outer),
        :global([data-theming-css-variables-demo] .bn-block-content),
        :global([data-theming-css-variables-demo] .bn-block),
        :global(.dark [data-theming-css-variables-demo] .bn-editor),
        :global(.dark [data-theming-css-variables-demo] .bn-block-outer),
        :global(.dark [data-theming-css-variables-demo] .bn-block-content),
        :global(.dark [data-theming-css-variables-demo] .bn-block) {
          background-color: transparent !important;
        }
        :global([data-theming-css-variables-demo] .bn-editor *) {
          color: var(--editor-text-color) !important;
        }
        :global([data-theming-css-variables-demo] .bn-inline-content *) {
          color: var(--editor-text-color) !important;
        }
        :global([data-theming-css-variables-demo] .ProseMirror *) {
          color: var(--editor-text-color) !important;
        }
      `}</style>
      <BlockNoteView 
        editor={editor} 
        theme={isDarkMode ? "dark" : "light"}
        data-theming-css-variables-demo
        onChange={handleContentChange}
      />
    </div>
  );
}