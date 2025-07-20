import { NextRequest, NextResponse } from 'next/server';
import { reorderTodos } from '@/lib/todo';
import type { ReorderRequest } from '@/lib/types';

export async function PATCH(request: NextRequest) {
  try {
    const body: ReorderRequest = await request.json();
    
    await reorderTodos(
      body.sourceId,
      body.destinationId,
      body.section
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering todos:', error);
    return NextResponse.json({ error: 'Failed to reorder todos' }, { status: 500 });
  }
}