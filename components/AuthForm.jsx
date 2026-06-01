'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { btnPrimary, inputClass } from '@/lib/ui/theme.js';

const authInputClass = `${inputClass} py-3.5 text-base sm:py-3 sm:text-sm`;

const FEATURES = [
  'Upload documents per conversation',
  'Answers grounded in your files',
  'Private, isolated chat history',
];

function Logo({ size = 'md' }) {
  const box = size === 'sm' ? 'h-9 w-9 rounded-xl text-sm' : 'h-11 w-11 rounded-2xl text-lg';
  const text = size === 'sm' ? 'text-xl' : 'text-2xl';
  return (
    <div className="flex items-center gap-2.5 sm:gap-3">
      <div
        className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-violet-500 to-cyan-500 font-bold text-white shadow-lg shadow-violet-500/25 ${box}`}
      >
        A
      </div>
      <span className={`font-semibold tracking-tight text-white ${text}`}>Assistio</span>
    </div>
  );
}

export default function AuthForm({ mode }) {
  const router = useRouter();
  const isSignup = mode === 'signup';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${isSignup ? 'signup' : 'signin'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name: isSignup ? name : undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');

      router.push('/chat');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-slate-950">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-violet-600/25 blur-[80px] sm:-left-32 sm:h-[28rem] sm:w-[28rem] sm:blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-cyan-500/15 blur-[70px] sm:h-[24rem] sm:w-[24rem] sm:blur-[90px]" />
        <div
          className="absolute inset-0 opacity-[0.3] sm:opacity-[0.35]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.12) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col lg:min-h-[100dvh] lg:flex-row">
        {/* Brand panel — compact on mobile, full on desktop */}
        <div className="px-4 pb-2 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 sm:pb-4 sm:pt-8 lg:flex lg:w-[46%] lg:flex-col lg:justify-center lg:px-12 lg:py-16 xl:px-16">
          <Logo />

          <h1 className="mt-5 text-2xl font-semibold leading-snug tracking-tight text-white sm:mt-8 sm:text-3xl sm:leading-tight lg:mt-10 lg:text-4xl">
            {isSignup ? 'Start your intelligent workspace' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400 sm:mt-4 sm:text-base">
            {isSignup
              ? 'Upload documents, chat with AI, and keep every conversation organized.'
              : 'Sign in to continue with your documents and conversations.'}
          </p>

          <ul className="mt-5 space-y-2.5 sm:mt-8 sm:space-y-3 lg:mt-10 lg:space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300 sm:gap-3 sm:text-sm">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 sm:h-5 sm:w-5">
                  <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Form panel */}
        <div className="flex flex-1 items-start justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-10 sm:pt-4 lg:items-center lg:px-10 lg:py-16">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl sm:p-8 lg:bg-slate-900/70 lg:p-10">
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              {isSignup ? 'Create your account' : 'Sign in'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {isSignup
                ? 'Free tokens included to get you started'
                : 'Enter your credentials to continue'}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3.5 sm:mt-8 sm:gap-4">
              {isSignup && (
                <div>
                  <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-slate-400">
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className={authInputClass}
                    autoComplete="name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoCapitalize="none"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className={authInputClass}
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-slate-400">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  disabled={loading}
                  className={authInputClass}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-sm text-red-200 sm:px-4 sm:py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`mt-1 w-full py-3.5 text-base active:scale-[0.99] sm:py-3 sm:text-sm ${btnPrimary}`}
              >
                {loading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Please wait…
                  </span>
                ) : isSignup ? (
                  'Create account'
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm leading-relaxed text-slate-400 sm:mt-8">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
                  >
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  New to Assistio?{' '}
                  <Link
                    href="/signup"
                    className="font-medium text-violet-300 underline-offset-2 hover:text-violet-200 hover:underline"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
