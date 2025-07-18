'use client';

import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import TodoItem from './TodoItem';
import TodoModal from './TodoModal';
import type { Todo, UpdateTodoRequest } from '@/lib/types';

interface TodoListProps {
  todos: Todo[];
  onUpdate: (id: string, request: UpdateTodoRequest) => void;
  onDelete: (id: string) => void;
  onReorder: (
    sourceIndex: number,
    destinationIndex: number,
    sourceSection: string,
    destinationSection: string
  ) => void;
  allTags?: string[];
}

function SectionHeader({ 
  sectionKey, 
  title, 
  count, 
  isDragActive 
}: { 
  sectionKey: string; 
  title: string; 
  count: number; 
  isDragActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: sectionKey,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
        isDragActive 
          ? isOver 
            ? 'bg-blue-200 dark:bg-blue-800 border-2 border-blue-400 dark:border-blue-600' 
            : 'bg-gray-200 dark:bg-gray-700 border-2 border-dashed border-gray-400 dark:border-gray-600'
          : 'bg-gray-100 dark:bg-gray-800'
      }`}
    >
      <h2 className="text-base font-medium text-gray-700 dark:text-gray-300">
        {title} ({count})
      </h2>
      {isDragActive && (
        <div className="text-sm text-gray-600 dark:text-gray-300">
          {isOver ? 'ここにドロップ' : 'ドロップ可能'}
        </div>
      )}
    </div>
  );
}

export default function TodoList({
  todos,
  onUpdate,
  onDelete,
  onReorder,
  allTags = [],
}: TodoListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const sections = {
    today: { title: '今日やる', todos: todos.filter(t => t.meta.section === 'today') },
    week: { title: '今週やる', todos: todos.filter(t => t.meta.section === 'week') },
    longterm: { title: '長期', todos: todos.filter(t => t.meta.section === 'longterm') },
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // セクションの特定
    const getSection = (id: string) => {
      if (id === 'today' || id === 'week' || id === 'longterm') return id;
      const todo = todos.find(t => t.meta.id === id);
      return todo?.meta.section || 'today';
    };

    const activeSection = getSection(activeId);
    const overSection = getSection(overId);

    if (activeId === overId) return;

    // インデックスの計算
    const activeTodos = sections[activeSection as keyof typeof sections].todos;
    const overTodos = sections[overSection as keyof typeof sections].todos;

    const activeIndex = activeTodos.findIndex(t => t.meta.id === activeId);
    let overIndex = overTodos.findIndex(t => t.meta.id === overId);

    // セクションヘッダーにドロップした場合
    if (overId === 'today' || overId === 'week' || overId === 'longterm') {
      overIndex = overTodos.length;
    }

    onReorder(activeIndex, overIndex, activeSection, overSection);
  };


  const handleTodoClick = (todo: Todo) => {
    setSelectedTodo(todo);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTodo(null);
  };

  const activeTodo = activeId ? todos.find(t => t.meta.id === activeId) : null;

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-8">
        {/* セクション表示 */}
        {Object.entries(sections).map(([sectionKey, section]) => (
          <div key={sectionKey} className="space-y-4">
            <SectionHeader
              sectionKey={sectionKey}
              title={section.title}
              count={section.todos.length}
              isDragActive={!!activeId}
            />

            <SortableContext
              items={section.todos.map(t => t.meta.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {section.todos.map(todo => (
                  <TodoItem
                    key={todo.meta.id}
                    todo={todo}
                    onUpdate={onUpdate}
                    onDelete={onDelete}
                    onClick={() => handleTodoClick(todo)}
                  />
                ))}
                {section.todos.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    TODOがありません
                  </p>
                )}
              </div>
            </SortableContext>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTodo && (
          <TodoItem
            todo={activeTodo}
            onUpdate={() => {}}
            onDelete={() => {}}
            onClick={() => {}}
          />
        )}
      </DragOverlay>

      <TodoModal
        todo={selectedTodo}
        isOpen={showModal}
        onClose={handleModalClose}
        onUpdate={onUpdate}
        onDelete={onDelete}
        allTags={allTags}
      />
    </DndContext>
  );
}