import { NextRequest, NextResponse } from 'next/server';
import { reorderTodos } from '@/lib/todo';
import type { ReorderRequest } from '@/lib/types';

export async function PATCH(request: NextRequest) {
  try {
    const body: ReorderRequest = await request.json();
    
    const todos = await reorderTodos(
      body.sourceIndex,
      body.destinationIndex,
      body.sourceSection,
      body.destinationSection
    );
    
    return NextResponse.json(todos);
  } catch (error) {
    console.error('Error reordering todos:', error);
    return NextResponse.json({ error: 'Failed to reorder todos' }, { status: 500 });
  }
}