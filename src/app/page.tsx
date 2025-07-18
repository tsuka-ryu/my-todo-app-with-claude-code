'use client';

import { useState } from 'react';
import { useTodos } from '@/hooks/useTodos';
import { useSearch } from '@/hooks/useSearch';
import { useDarkMode } from '@/hooks/useDarkMode';
import SearchBar from '@/components/SearchBar';
import FilterBar from '@/components/FilterBar';
import TodoList from '@/components/TodoList';
import NewTodoForm from '@/components/NewTodoForm';

export default function Home() {
  const [showSearch, setShowSearch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showNewTodo, setShowNewTodo] = useState(false);
  
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
  } = useTodos();

  const {
    searchQuery,
    setSearchQuery,
    selectedTags,
    selectedPriorities,
    showCompleted,
    setShowCompleted,
    allTags,
    filteredTodos,
    toggleTag,
    togglePriority,
    clearFilters,
  } = useSearch(todos);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-gray-600 dark:text-gray-400">読み込み中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-red-600 dark:text-red-400">エラー: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">TODO管理</h1>
              <p className="text-gray-600 dark:text-gray-400">マークダウンベースのTODO管理システム</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg transition-colors bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title={isDarkMode ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <button
                onClick={() => setShowNewTodo(!showNewTodo)}
                className={`p-2 rounded-lg transition-colors ${
                  showNewTodo ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="新しいTODOを追加"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`p-2 rounded-lg transition-colors ${
                  showSearch || searchQuery ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="検索"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters || selectedTags.length > 0 || selectedPriorities.length > 0 || !showCompleted 
                    ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="フィルター"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="space-y-6">
          {showNewTodo && (
            <NewTodoForm 
              onCreate={createTodo}
              onCancel={() => setShowNewTodo(false)}
              allTags={allTags}
            />
          )}

          {showSearch && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearFilters={clearFilters}
              />
            </div>
          )}

          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
              <FilterBar
                allTags={allTags}
                selectedTags={selectedTags}
                selectedPriorities={selectedPriorities}
                showCompleted={showCompleted}
                onToggleTag={toggleTag}
                onTogglePriority={togglePriority}
                onToggleCompleted={setShowCompleted}
              />
            </div>
          )}

          <TodoList
            todos={filteredTodos}
            onUpdate={updateTodo}
            onDelete={deleteTodo}
            onReorder={reorderTodos}
            allTags={allTags}
          />
        </div>
      </div>
    </div>
  );
}
