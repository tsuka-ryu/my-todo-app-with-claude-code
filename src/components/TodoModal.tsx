"use client";

import { useState, useEffect, useCallback } from "react";
import type { Todo, UpdateTodoRequest } from "@/lib/types";
import RichTextEditor from "./RichTextEditor";
import TagSelector from "./TagSelector";

interface TodoModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, request: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
  allTags?: string[];
  isDarkMode?: boolean;
}

export default function TodoModal({
  todo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  allTags = [],
  isDarkMode = false,
}: TodoModalProps) {
  // 常にWYSIWYG編集モードにするため、isEditingステートを削除
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPriority, setEditPriority] = useState<"high" | "medium" | "low">(
    "medium"
  );
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editDueDate, setEditDueDate] = useState("");
  // プレビュー用コンテンツステートを削除（常にWYSIWYG編集のため）
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // 自動保存機能（debounce付き）
  const autoSave = useCallback(async () => {
    if (!todo) return;

    setIsSaving(true);
    try {
      onUpdate(todo.meta.id, {
        title: editTitle,
        content: editContent,
        priority: editPriority,
        tags: editTags,
        dueDate: editDueDate || undefined,
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    todo,
    editTitle,
    editContent,
    editPriority,
    editTags,
    editDueDate,
    onUpdate,
  ]);

  useEffect(() => {
    if (todo) {
      setEditTitle(todo.meta.title);
      setEditContent(todo.content);
      setEditPriority(todo.meta.priority);
      setEditTags(todo.meta.tags);
      setEditDueDate(todo.meta.dueDate || "");
    }
  }, [todo]);

  // debounce用のタイマー
  useEffect(() => {
    if (!todo) return;

    const timer = setTimeout(() => {
      autoSave();
    }, 10000); // 10秒後に自動保存

    return () => clearTimeout(timer);
  }, [autoSave, todo]);

  if (!isOpen || !todo) return null;

  // resetEditState関数は自動保存機能により不要になったため削除

  const handleClose = () => {
    if (todo) {
      onUpdate(todo.meta.id, {
        title: editTitle,
        content: editContent,
        priority: editPriority,
        tags: editTags,
        dueDate: editDueDate || undefined,
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (confirm("このTODOを削除しますか？")) {
      onDelete(todo.meta.id);
      onClose();
    }
  };

  const handleCopyFilename = async () => {
    try {
      await navigator.clipboard.writeText(`${todo.meta.id}.md`);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error("Failed to copy filename:", err);
    }
  };

  const priorityColors = {
    high: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    medium:
      "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
    low: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
  };

  const priorityLabels = { high: "高", medium: "中", low: "低" };

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 transition-opacity duration-300 z-40 ${
          isOpen ? "" : "pointer-events-none"
        }`}
        onClick={handleClose}
      />

      {/* サイドパネル */}
      <div
        className={`fixed top-0 right-0 h-full w-[70vw] bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-700 ease-out z-50 ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            {/* ヘッダー */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {todo.meta.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={handleCopyFilename}
                    className={`text-gray-400 hover:text-green-600 transition-colors ${
                      showCopyFeedback ? "text-green-600" : ""
                    }`}
                    title="ファイル名をコピー"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {showCopyFeedback && (
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      コピーしました
                    </div>
                  )}
                </div>
                {/* 常にWYSIWYG編集モードのため、編集/プレビュー切り替えボタンを削除 */}
                <button
                  onClick={handleDelete}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                  title="削除"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="閉じる"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* メタ情報 */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  priorityColors[todo.meta.priority]
                }`}
              >
                {priorityLabels[todo.meta.priority]}
              </span>
              {todo.meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                作成:{" "}
                {new Date(todo.meta.createdAt).toLocaleDateString("ja-JP")}
              </span>
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                更新:{" "}
                {new Date(todo.meta.updatedAt).toLocaleDateString("ja-JP")}
              </span>
              {todo.meta.dueDate && (
                <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                  期限:{" "}
                  {new Date(todo.meta.dueDate).toLocaleDateString("ja-JP")}
                </span>
              )}
            </div>

            {/* コンテンツ - 常にWYSIWYG編集モード */}
            <div className="space-y-4 flex flex-col h-full">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="TODOのタイトルを入力..."
                />
              </div>

              {/* コンパクトなメタ情報エリア */}
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-shrink-0">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    優先度
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) =>
                      setEditPriority(
                        e.target.value as "high" | "medium" | "low"
                      )
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
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    タグ
                  </label>
                  <TagSelector
                    selectedTags={editTags}
                    onChange={setEditTags}
                    allTags={allTags}
                    placeholder="タグを選択..."
                  />
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  詳細内容
                </label>
                {!!editContent ? (
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    isDarkMode={isDarkMode}
                  />
                ) : (
                  <div className="text-gray-500 dark:text-gray-400">
                    コンテンツがありません
                  </div>
                )}
              </div>
            </div>

            {/* 自動保存インジケーター */}
            {isSaving && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                保存中...
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
