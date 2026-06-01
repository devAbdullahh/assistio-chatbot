import { NextResponse } from 'next/server';
import { ensureReady } from '@/lib/init.js';
import { requireAuth, AuthError, unauthorizedResponse } from '@/lib/auth/requireAuth.js';
import { getChatForUser, deleteChatForUser } from '@/lib/services/chats.js';
import { getChatStats } from '@/lib/services/rag.js';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    await ensureReady();
    const { userId } = await requireAuth();
    const { id } = await params;

    const chat = await getChatForUser(userId, id);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
    }

    const docStats = await getChatStats(userId, id);

    return NextResponse.json({
      ...chat,
      documents: docStats.documents,
      documentCount: docStats.documentCount,
    });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_request, { params }) {
  try {
    await ensureReady();
    const { userId } = await requireAuth();
    const { id } = await params;

    const deleted = await deleteChatForUser(userId, id);
    if (!deleted) {
      return NextResponse.json({ error: 'Chat not found.' }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) return unauthorizedResponse();
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
