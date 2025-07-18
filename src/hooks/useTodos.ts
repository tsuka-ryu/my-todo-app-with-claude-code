import { useState, useEffect, useCallback } from 'react';
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from '@/lib/types';

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/todos');
      if (!response.ok) throw new Error('Failed to fetch todos');
      const data = await response.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTodo = useCallback(async (request: CreateTodoRequest) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to create todo');
      const newTodo = await response.json();
      setTodos(prev => [...prev, newTodo]);
      return newTodo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const updateTodo = useCallback(async (id: string, request: UpdateTodoRequest) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });
      if (!response.ok) throw new Error('Failed to update todo');
      const updatedTodo = await response.json();
      setTodos(prev => prev.map(todo => 
        todo.meta.id === id ? updatedTodo : todo
      ));
      return updatedTodo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const deleteTodo = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete todo');
      setTodos(prev => prev.filter(todo => todo.meta.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, []);

  const reorderTodos = useCallback(async (
    sourceIndex: number,
    destinationIndex: number,
    sourceSection: string,
    destinationSection: string
  ) => {
    // 楽観的更新：UIを即座に更新
    const optimisticUpdate = () => {
      setTodos(prev => {
        const newTodos = [...prev];
        
        // セクション別にフィルタリング
        const sections = {
          today: newTodos.filter(t => t.meta.section === 'today'),
          week: newTodos.filter(t => t.meta.section === 'week'),
          longterm: newTodos.filter(t => t.meta.section === 'longterm'),
        };
        
        const sourceItems = sections[sourceSection as keyof typeof sections];
        const targetItems = sections[destinationSection as keyof typeof sections];
        
        if (!sourceItems || sourceIndex < 0 || sourceIndex >= sourceItems.length) {
          return prev;
        }
        
        const [movedItem] = sourceItems.splice(sourceIndex, 1);
        movedItem.meta.section = destinationSection as 'today' | 'week' | 'longterm';
        
        const finalDestIndex = Math.min(destinationIndex, targetItems.length);
        targetItems.splice(finalDestIndex, 0, movedItem);
        
        return [...sections.today, ...sections.week, ...sections.longterm];
      });
    };
    
    // 楽観的更新を即座に実行
    optimisticUpdate();
    
    try {
      await fetch('/api/todos/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceIndex,
          destinationIndex,
          sourceSection,
          destinationSection,
        }),
      });
    } catch (err) {
      // エラー時は元のデータを再取得
      fetchTodos();
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  }, [fetchTodos]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  return {
    todos,
    loading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
  };
}