import { NextRequest, NextResponse } from 'next/server';
import { getAllTodos, createTodo } from '@/lib/todo';
import type { CreateTodoRequest } from '@/lib/types';

export async function GET() {
  try {
    const todos = await getAllTodos();
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json({ error: 'Failed to fetch todos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateTodoRequest = await request.json();
    
    if (!body.content || body.content.trim() === '') {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    const todo = await createTodo(body);
    return NextResponse.json(todo, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json({ error: 'Failed to create todo' }, { status: 500 });
  }
}