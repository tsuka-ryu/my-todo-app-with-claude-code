export interface TodoMeta {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
  order: number;
  section: 'today' | 'week' | 'longterm';
  dueDate?: string;
  slug?: string;
}

export interface Todo {
  meta: TodoMeta;
  content: string;
}

export interface CreateTodoRequest {
  title: string;
  content: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  section?: 'today' | 'week' | 'longterm';
  dueDate?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  content?: string;
  completed?: boolean;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  section?: 'today' | 'week' | 'longterm';
  dueDate?: string;
  order?: number;
}

export interface ReorderRequest {
  sourceId: string;
  destinationId: string | null;
  section: string;
}