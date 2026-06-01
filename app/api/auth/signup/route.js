import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect.js';
import { User } from '@/lib/db/models/User.js';
import { hashPassword } from '@/lib/auth/password.js';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session.js';
import { validateEmail, validatePassword, validateName } from '@/lib/utils/validation.js';
import {
  getDefaultTokenFields,
  formatTokenStats,
  ensureUserTokens,
} from '@/lib/services/tokens.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    if (!validatePassword(password)) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }
    if (name && !validateName(name)) {
      return NextResponse.json({ error: 'Invalid name.' }, { status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const tokenFields = getDefaultTokenFields();
    const user = await User.create({
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
      name: name?.trim() || '',
      ...tokenFields,
    });

    const token = await createSessionToken(user._id.toString());
    await setSessionCookie(token);

    const tokenUser = await ensureUserTokens(user._id.toString());

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        tokens: formatTokenStats(tokenUser),
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
