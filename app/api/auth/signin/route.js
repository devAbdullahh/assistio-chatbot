import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect.js';
import { User } from '@/lib/db/models/User.js';
import { verifyPassword } from '@/lib/auth/password.js';
import { createSessionToken, setSessionCookie } from '@/lib/auth/session.js';
import { validateEmail, validatePassword } from '@/lib/utils/validation.js';
import { ensureUserTokens, formatTokenStats } from '@/lib/services/tokens.js';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!validateEmail(email) || !validatePassword(password)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const tokenUser = await ensureUserTokens(user._id.toString());
    const sessionToken = await createSessionToken(user._id.toString());
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        tokens: formatTokenStats(tokenUser),
      },
    });
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
