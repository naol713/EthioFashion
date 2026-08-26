import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });
    }
    return NextResponse.json({ role: user.role, email: user.email });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
