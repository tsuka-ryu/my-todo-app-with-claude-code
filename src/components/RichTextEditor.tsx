"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [localContent, setLocalContent] = useState(content);

  const editor = useCreateBlockNote();

  const handleContentChange = useCallback(async () => {
    try {
      const markdown = await editor.blocksToMarkdownLossy(editor.document);
      setLocalContent(markdown);
    } catch (error) {
      console.error("Failed to convert to markdown:", error);
    }
  }, [editor]);

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
        console.error("Content loading failed:", error);
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
      className={`min-h-[550px] ${styles.editor}`}
      data-theme={isDarkMode ? "dark" : "light"}
    >
      <BlockNoteView
        editor={editor}
        theme={isDarkMode ? "dark" : "light"}
        onChange={handleContentChange}
      />
    </div>
  );
}
