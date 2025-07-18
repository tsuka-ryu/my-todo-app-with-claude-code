'use client';

import { useState } from 'react';
import type { CreateTodoRequest } from '@/lib/types';

interface NewTodoFormProps {
  onCreate: (request: CreateTodoRequest) => void;
  onCancel: () => void;
}

export default function NewTodoForm({ onCreate, onCancel }: NewTodoFormProps) {
  const [content, setContent] = useState('');
  const [section, setSection] = useState<'today' | 'week' | 'longterm'>('today');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [tags, setTags] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      onCreate({
        content: content.trim(),
        section,
        priority,
        tags: tagArray,
      });
      setContent('');
      setTags('');
      onCancel();
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">新しいTODOを追加</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="TODOの内容を入力..."
            className="w-full p-3 border border-gray-300 rounded-lg resize-none"
            rows={4}
            autoFocus
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              セクション
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value as 'today' | 'week' | 'longterm')}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="today">今日やる</option>
              <option value="week">今週やる</option>
              <option value="longterm">長期</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              優先度
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            作成
          </button>
        </div>
      </div>
    </div>
  );
}