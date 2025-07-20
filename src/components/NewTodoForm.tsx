"use client";

import { useState } from "react";
import type { CreateTodoRequest } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";
import TagSelector from "./TagSelector";

interface NewTodoFormProps {
  onCreate: (request: CreateTodoRequest) => void;
  onCancel: () => void;
  allTags?: string[];
  isDarkMode?: boolean;
}

export default function NewTodoForm({
  onCreate,
  onCancel,
  allTags = [],
  isDarkMode = false,
}: NewTodoFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [section, setSection] = useState<"today" | "week" | "longterm">(
    "today"
  );
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = () => {
    if (title.trim()) {
      onCreate({
        title: title.trim(),
        content: content.trim(),
        section,
        priority,
        tags,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setContent("");
      setTags([]);
      setDueDate("");
      onCancel();
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        新しいTODOを追加
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            タイトル
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="TODOのタイトルを入力..."
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        </div>

        {/* コンパクトなメタ情報エリア */}
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              セクション
            </label>
            <select
              value={section}
              onChange={(e) =>
                setSection(e.target.value as "today" | "week" | "longterm")
              }
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="today">今日やる</option>
              <option value="week">今週やる</option>
              <option value="longterm">長期</option>
            </select>
          </div>
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              優先度
            </label>
            <select
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as "high" | "medium" | "low")
              }
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              期限
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              タグ
            </label>
            <TagSelector
              selectedTags={tags}
              onChange={setTags}
              allTags={allTags}
              placeholder="タグを選択または作成..."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            詳細内容
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
}
