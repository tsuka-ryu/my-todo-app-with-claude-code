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
  const [isEditorReady, setIsEditorReady] = useState(false);

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
      onChange(markdown);
    } catch (error) {
      console.error('Failed to convert to markdown:', error);
    }
  }, [onChange]);

  const editor = useMemo(() => {
    const editorInstance = BlockNoteEditor.create({
      initialContent: [
        {
          id: "initial",
          type: "paragraph" as const,
          content: "",
        },
      ],
    });
    
    // エディタの準備完了を確認
    // BlockNoteにはonEditorReadyメソッドがないため、タイマーで初期化を待つ
    setTimeout(() => {
      console.log('BlockNote editor is ready');
      setIsEditorReady(true);
    }, 200);
    
    return editorInstance;
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      if (!isEditorReady) {
        console.log('Editor not ready yet, waiting...');
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Loading content:', content);
        
        // エディタが初期化されるまで少し待つ
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (content && content.trim()) {
          // Parse markdown content to blocks
          const blocks = await editor.tryParseMarkdownToBlocks(content);
          console.log('Parsed blocks:', blocks);
          
          if (blocks && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
          } else {
            // Fallback: try to create a simple paragraph with the content
            try {
              const fallbackBlock = {
                id: "fallback",
                type: "paragraph" as const,
                content: content,
              };
              editor.replaceBlocks(editor.document, [fallbackBlock]);
            } catch (fallbackError) {
              console.error('Fallback block creation failed:', fallbackError);
              // Final fallback to empty block
              const initialBlock = {
                id: "initial",
                type: "paragraph" as const,
                content: "",
              };
              editor.replaceBlocks(editor.document, [initialBlock]);
            }
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
        // Always fallback to a safe initial state with content as text
        try {
          if (content && content.trim()) {
            const textBlock = {
              id: "text-fallback",
              type: "paragraph" as const,
              content: content,
            };
            editor.replaceBlocks(editor.document, [textBlock]);
          } else {
            const initialBlock = {
              id: "initial",
              type: "paragraph" as const, 
              content: "",
            };
            editor.replaceBlocks(editor.document, [initialBlock]);
          }
        } catch (finalError) {
          console.error('Final fallback failed:', finalError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [content, editor, isEditorReady]);


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