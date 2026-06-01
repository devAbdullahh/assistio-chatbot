import { NextResponse } from 'next/server';
import { ensureReady } from '@/lib/init.js';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth/requireAuth.js';
import { listChats, createChat } from '@/lib/services/chats.js';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureReady();
    const { userId } = await requireAuth();
    const chats = await listChats(userId);
    return NextResponse.json({ chats });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await ensureReady();
    const { userId } = await requireAuth();
    const chat = await createChat(userId);
    return NextResponse.json(chat);
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
