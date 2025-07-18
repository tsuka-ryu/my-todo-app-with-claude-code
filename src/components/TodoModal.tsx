'use client';

import { useState, useEffect } from 'react';
import type { Todo, UpdateTodoRequest } from '@/lib/types';

interface TodoModalProps {
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, request: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
}

export default function TodoModal({
  todo,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
}: TodoModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editPriority, setEditPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [editTags, setEditTags] = useState('');

  useEffect(() => {
    if (todo) {
      setEditContent(todo.content);
      setEditPriority(todo.meta.priority);
      setEditTags(todo.meta.tags.join(', '));
    }
  }, [todo]);

  if (!isOpen || !todo) return null;

  const handleSave = () => {
    const tags = editTags.split(',').map(tag => tag.trim()).filter(tag => tag);
    onUpdate(todo.meta.id, {
      content: editContent,
      priority: editPriority,
      tags,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('このTODOを削除しますか？')) {
      onDelete(todo.meta.id);
      onClose();
    }
  };

  const toggleCompleted = () => {
    onUpdate(todo.meta.id, { completed: !todo.meta.completed });
  };

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
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
      <div className={`fixed top-0 right-0 h-full w-[70vw] bg-white shadow-xl transform transition-all duration-700 ease-out z-50 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="h-full overflow-y-auto">
          <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {todo.content.split('\n')[0].replace(/^#\s*/, '')}
              </h2>
            </div>
            <div className="flex items-center gap-2">
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
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {tag}
              </span>
            ))}
            <span className="px-2 py-1 text-xs text-gray-500">
              作成: {new Date(todo.meta.createdAt).toLocaleDateString('ja-JP')}
            </span>
            <span className="px-2 py-1 text-xs text-gray-500">
              更新: {new Date(todo.meta.updatedAt).toLocaleDateString('ja-JP')}
            </span>
          </div>

          {/* コンテンツ */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  内容
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={10}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    優先度
                  </label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as 'high' | 'medium' | 'low')}
                    className="w-full p-2 border border-gray-300 rounded"
                  >
                    <option value="low">低</option>
                    <option value="medium">中</option>
                    <option value="high">高</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    タグ（カンマ区切り）
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-800">
                {todo.content}
              </pre>
            </div>
          )}

          {/* アクションボタン */}
          {isEditing && (
            <div className="flex gap-2 mt-6 pt-4 border-t">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                保存
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
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