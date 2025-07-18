'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Todo, UpdateTodoRequest } from '@/lib/types';

interface TodoItemProps {
  todo: Todo;
  onUpdate: (id: string, request: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
  onClick: () => void;
}

export default function TodoItem({ todo, onUpdate, onDelete, onClick }: TodoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.meta.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const toggleCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(todo.meta.id, { completed: !todo.meta.completed });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('このTODOを削除しますか？')) {
      onDelete(todo.meta.id);
    }
  };

  const priorityColors = {
    high: 'bg-red-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };

  // タイトルを抽出（最初の行の#を除去）
  const title = todo.content.split('\n')[0].replace(/^#\s*/, '').trim();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
        todo.meta.completed ? 'opacity-60' : ''
      }`}
      onClick={onClick}
    >
      {/* ドラッグハンドル */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-move text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 6h8v2H6V6zm0 4h8v2H6v-2zm0 4h8v2H6v-2z" />
        </svg>
      </div>

      {/* チェックボックス */}
      <button
        onClick={toggleCompleted}
        className="flex-shrink-0 w-5 h-5 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors flex items-center justify-center"
      >
        {todo.meta.completed && (
          <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* 優先度インジケーター */}
      <div
        className={`w-2 h-2 rounded-full ${priorityColors[todo.meta.priority]}`}
        title={`優先度: ${todo.meta.priority === 'high' ? '高' : todo.meta.priority === 'medium' ? '中' : '低'}`}
      />

      {/* タイトル */}
      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-medium text-gray-900 truncate ${
            todo.meta.completed ? 'line-through' : ''
          }`}
        >
          {title}
        </div>
      </div>

      {/* タグ（最初の1つのみ表示） */}
      {todo.meta.tags.length > 0 && (
        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
          {todo.meta.tags[0]}
          {todo.meta.tags.length > 1 && ` +${todo.meta.tags.length - 1}`}
        </span>
      )}

      {/* 期限日 */}
      <span className="text-xs text-gray-500 hidden sm:block">
        {todo.meta.dueDate ? 
          new Date(todo.meta.dueDate).toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric'
          }) :
          new Date(todo.meta.updatedAt).toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric'
          })
        }
      </span>

      {/* 削除ボタン */}
      <button
        onClick={handleDelete}
        className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}