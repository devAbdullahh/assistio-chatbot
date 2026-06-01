import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect.js';
import { getSession } from '@/lib/auth/session.js';
import { User } from '@/lib/db/models/User.js';
import { ensureUserTokens, formatTokenStats } from '@/lib/services/tokens.js';

export class AuthError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.status = 401;
  }
}

export async function requireAuth() {
  const session = await getSession();
  if (!session?.userId) {
    throw new AuthError();
  }

  await connectDB();
  const user = await ensureUserTokens(session.userId);

  if (!user) {
    throw new AuthError('Session invalid. Please sign in again.');
  }

  const fullUser = await User.findById(session.userId).select('-passwordHash').lean();

  return {
    userId: user._id.toString(),
    user: {
      id: user._id.toString(),
      email: fullUser.email,
      name: fullUser.name,
      tokens: formatTokenStats(user),
    },
  };
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function withAuth(handler) {
  return async (...args) => {
    try {
      const auth = await requireAuth();
      return handler(...args, auth);
    } catch (error) {
      if (error instanceof AuthError) {
        return unauthorizedResponse();
      }
      throw error;
    }
  };
}
