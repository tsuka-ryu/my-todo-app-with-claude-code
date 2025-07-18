'use client';

import { useState, useEffect } from 'react';
import type { Todo, UpdateTodoRequest } from '@/lib/types';
import RichTextEditor from './RichTextEditor';
import TagSelector from './TagSelector';
import { prepareContentForEditor } from '@/lib/markdown';

interface TodoModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, request: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
  allTags?: string[];
}

export default function TodoModal({
  todo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  allTags = [],
}: TodoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editTags, setEditTags] = useState<string[]>([]);
  const [editDueDate, setEditDueDate] = useState('');
  const [displayContent, setDisplayContent] = useState('');
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  useEffect(() => {
    if (todo) {
      setEditTitle(todo.meta.title);
      setEditSlug(todo.meta.slug || '');
      setEditContent(todo.content);
      setEditPriority(todo.meta.priority);
      setEditTags(todo.meta.tags);
      setEditDueDate(todo.meta.dueDate || '');
      
      // 表示用のHTMLコンテンツを準備
      prepareContentForEditor(todo.content).then(setDisplayContent).catch(error => {
        console.error('Content display preparation failed:', error);
        setDisplayContent(todo.content);
      });
    }
  }, [todo, todo?.meta.dueDate, todo?.meta.title, todo?.meta.priority, todo?.meta.tags, todo?.content]);

  if (!isOpen || !todo) return null;

  const resetEditState = () => {
    if (todo) {
      setEditTitle(todo.meta.title);
      setEditSlug(todo.meta.slug || '');
      setEditContent(todo.content);
      setEditPriority(todo.meta.priority);
      setEditTags(todo.meta.tags);
      setEditDueDate(todo.meta.dueDate || '');
    }
  };

  const handleSave = () => {
    onUpdate(todo.meta.id, {
      title: editTitle,
      slug: editSlug.trim() || undefined,
      content: editContent,
      priority: editPriority,
      tags: editTags,
      dueDate: editDueDate || undefined,
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    resetEditState();
  };

  const handleDelete = () => {
    if (confirm('このTODOを削除しますか？')) {
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
      console.error('Failed to copy filename:', err);
    }
  };


  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    medium: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
    low: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  };

  const priorityLabels = { high: '高', medium: '中', low: '低' };

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className={`fixed inset-0 transition-opacity duration-300 z-40 ${
          isOpen ? '' : 'pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* サイドパネル */}
      <div className={`fixed top-0 right-0 h-full w-[70vw] bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-700 ease-out z-50 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
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
                  className={`text-gray-400 hover:text-green-600 transition-colors ${showCopyFeedback ? 'text-green-600' : ''}`}
                  title="ファイル名をコピー"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                {showCopyFeedback && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    コピーしました
                  </div>
                )}
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="編集"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleDelete}
                className="text-gray-400 hover:text-red-600 transition-colors"
                title="削除"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="閉じる"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* メタ情報 */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`px-2 py-1 text-xs rounded-full ${priorityColors[todo.meta.priority]}`}
            >
              {priorityLabels[todo.meta.priority]}
            </span>
            {todo.meta.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
            <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              作成: {new Date(todo.meta.createdAt).toLocaleDateString('ja-JP')}
            </span>
            <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
              更新: {new Date(todo.meta.updatedAt).toLocaleDateString('ja-JP')}
            </span>
            {todo.meta.dueDate && (
              <span className="px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
                期限: {new Date(todo.meta.dueDate).toLocaleDateString('ja-JP')}
              </span>
            )}
          </div>

          {/* コンテンツ */}
          {isEditing ? (
            <div className="space-y-4">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  スラッグ（URL識別子）
                </label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="ファイル名として使用される識別子"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  英数字、日本語、ハイフン、アンダースコアが使用可能です。
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  詳細内容
                </label>
                <RichTextEditor
                  content={editContent}
                  onChange={setEditContent}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    優先度
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    期限
                  </label>
                  <input
                    type="date"
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    タグ
                  </label>
                  <TagSelector
                    selectedTags={editTags}
                    onChange={setEditTags}
                    allTags={allTags}
                    placeholder="タグを選択または作成..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          )}

          {/* アクションボタン */}
          {isEditing && (
            <div className="flex gap-2 mt-6 pt-4 border-t dark:border-gray-600">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 dark:bg-gray-600 text-white rounded hover:bg-gray-600 dark:hover:bg-gray-500"
              >
                キャンセル
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}