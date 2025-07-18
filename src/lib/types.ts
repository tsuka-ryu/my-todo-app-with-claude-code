export interface TodoMeta {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  order: number;
  section: 'today' | 'week' | 'longterm';
  dueDate?: string;
}

export interface Todo {
  meta: TodoMeta;
  content: string;
}

export interface CreateTodoRequest {
  title: string;
  slug?: string;
  content: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  section?: 'today' | 'week' | 'longterm';
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  slug?: string;
  content?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  section?: 'today' | 'week' | 'longterm';
  dueDate?: string;
}

export interface ReorderRequest {
  sourceIndex: number;
  destinationIndex: number;
  sourceSection: string;
  destinationSection: string;
}