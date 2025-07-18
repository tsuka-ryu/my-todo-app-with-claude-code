import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Todo } from '@/lib/types';

export function useSearch(todos: Todo[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [showCompleted, setShowCompleted] = useState(true);

  const fuse = useMemo(() => {
    return new Fuse(todos, {
      keys: [
        { name: 'meta.title', weight: 0.6 },
        { name: 'content', weight: 0.3 },
        { name: 'meta.tags', weight: 0.1 },
      ],
      threshold: 0.4,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }, [todos]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    todos.forEach(todo => {
      todo.meta.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [todos]);

  const filteredTodos = useMemo(() => {
    let result = todos;

    // 検索クエリでフィルタリング
    if (searchQuery.trim()) {
      const searchResults = fuse.search(searchQuery);
      result = searchResults.map(r => r.item);
    }

    // タグでフィルタリング
    if (selectedTags.length > 0) {
      result = result.filter(todo =>
        selectedTags.some(tag => todo.meta.tags.includes(tag))
      );
    }

    // 優先度でフィルタリング
    if (selectedPriorities.length > 0) {
      result = result.filter(todo =>
        selectedPriorities.includes(todo.meta.priority)
      );
    }

    // 完了状態でフィルタリング
    if (!showCompleted) {
      result = result.filter(todo => !todo.meta.completed);
    }

    return result;
  }, [todos, searchQuery, selectedTags, selectedPriorities, showCompleted, fuse]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority)
        ? prev.filter(p => p !== priority)
        : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
    setSelectedPriorities([]);
    setShowCompleted(true);
  };

  return {
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
  };
}