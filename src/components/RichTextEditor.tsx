"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/react/style.css";
import "@blocknote/mantine/style.css";
import styles from "./RichTextEditor.module.css";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  isDarkMode?: boolean;
}

export default function RichTextEditor({
  content,
  onChange,
  isDarkMode = false,
}: RichTextEditorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useCreateBlockNote();

  // デバウンス関数
  const debounce = useCallback((func: () => void, delay: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(func, delay);
  }, []);

  const handleContentChange = useCallback(async () => {
    debounce(async () => {
      try {
        const markdown = await editor.blocksToMarkdownLossy(editor.document);
        onChange(markdown);
      } catch (error) {
        console.error("Failed to convert to markdown:", error);
      }
    }, 1000); // 1秒のデバウンス
  }, [editor, onChange, debounce]);

  // onBlur時に即座に保存
  const handleBlur = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      onChange(markdown);
    } catch (error) {
      console.error("Failed to convert to markdown:", error);
    }
  }, [editor, onChange]);

  // エディタの初期化
  useEffect(() => {
    const loadContent = async () => {
      try {
        if (content && content.trim()) {
          const blocks = await editor.tryParseMarkdownToBlocks(content);
          if (blocks && blocks.length > 0) {
            editor.replaceBlocks(editor.document, blocks);
          }
        }
      } catch (error) {
        console.error("Content loading failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
      className={`min-h-[550px] ${styles.editor}`}
      data-theme={isDarkMode ? "dark" : "light"}
      onBlur={handleBlur}
    >
      <BlockNoteView
        editor={editor}
        theme={isDarkMode ? "dark" : "light"}
        onChange={handleContentChange}
      />
    </div>
  );
}
