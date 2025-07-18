export interface TodoMeta {
  id: string;
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
  content: string;
  priority?: 'high' | 'medium' | 'low';
  tags?: string[];
  section?: 'today' | 'week' | 'longterm';
  dueDate?: string;
}

export interface UpdateTodoRequest {
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