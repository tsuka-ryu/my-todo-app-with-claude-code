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

  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches ||
        document.documentElement.classList.contains('dark');
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
      onChange(markdown);
    } catch (error) {
      console.error('Failed to convert to markdown:', error);
    }
  }, [onChange]);

  const editor = useMemo(() => {
    return BlockNoteEditor.create({
      initialContent: [
        {
          id: "initial",
          type: "paragraph" as const,
          content: "",
        },
      ],
    });
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        if (content && content.trim()) {
          // Parse markdown content to blocks
          const blocks = await editor.tryParseMarkdownToBlocks(content);
          if (blocks && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
          } else {
            // Fallback to initial block if parsing fails
            const initialBlock = {
              id: "initial",
              type: "paragraph" as const,
              content: "",
            };
            editor.replaceBlocks(editor.document, [initialBlock]);
          }
        } else {
          // For empty content, use initial empty paragraph
          const initialBlock = {
            id: "initial", 
            type: "paragraph" as const,
            content: "",
          };
          editor.replaceBlocks(editor.document, [initialBlock]);
        }
      } catch (error) {
        console.error('Content conversion failed:', error);
        // Always fallback to a safe initial state
        const initialBlock = {
          id: "initial",
          type: "paragraph" as const, 
          content: "",
        };
        editor.replaceBlocks(editor.document, [initialBlock]);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [content, editor]);


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
        '--editor-text-color': isDarkMode ? '#e5e7eb' : '#111827'
      } as React.CSSProperties}
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