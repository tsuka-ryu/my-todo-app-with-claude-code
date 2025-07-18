import { NextRequest, NextResponse } from 'next/server';
import { runMigration } from '@/lib/migrate';

export async function POST(_request: NextRequest) {
  try {
    await runMigration();
    return NextResponse.json({ success: true, message: 'Migration completed successfully' });
  } catch (error) {
    console.error('Migration failed:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}