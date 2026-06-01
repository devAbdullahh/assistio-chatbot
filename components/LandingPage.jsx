import Link from 'next/link';
import { btnPrimary, btnSecondary, glassPanel } from '@/lib/ui/theme.js';

const FEATURES = [
  {
    title: 'Per-chat documents',
    description:
      'Upload PDFs and text files to a specific conversation. Each chat keeps its own isolated knowledge base.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
  },
  {
    title: 'Grounded answers',
    description:
      'Hybrid vector + keyword search finds the right chunks before Gemini responds — fewer hallucinations, more citations.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
      />
    ),
  },
  {
    title: 'Private workspace',
    description:
      'Your chats, documents, and embeddings stay tied to your account. Sign out anytime — your data stays yours.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    ),
  },
  {
    title: 'Token-based usage',
    description:
      'Start with free tokens on signup. Every message and upload is metered so you always know where you stand.',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13 10V3L4 14h7v7l9-11h-7z"
      />
    ),
  },
];

const STEPS = [
  {
    step: '01',
    title: 'Create an account',
    description: 'Sign up in seconds and receive free tokens to explore Assistio.',
  },
  {
    step: '02',
    title: 'Upload & chat',
    description: 'Attach documents to a conversation, then ask questions in plain language.',
  },
  {
    step: '03',
    title: 'Get cited answers',
    description: 'See which document chunks powered each reply, with scores and excerpts.',
  },
];

function Logo({ className = '' }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 text-lg font-bold text-white shadow-lg shadow-violet-500/25">
        A
      </div>
      <span className="text-xl font-semibold tracking-tight text-white">Assistio</span>
    </Link>
  );
}

function DotGrid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgb(148 163 184 / 0.12) 1px, transparent 0)',
        backgroundSize: '24px 24px',
      }}
    />
  );
}

function ChatPreview() {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-1 shadow-2xl shadow-violet-900/30 backdrop-blur-xl ${glassPanel}`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 text-xs text-slate-500">Q4 Strategy.pdf · Product brief</span>
      </div>
      <div className="space-y-3 p-4">
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-violet-600 to-cyan-600 px-3.5 py-2.5 text-sm text-white shadow-lg shadow-violet-600/20">
            What were our top three priorities for Q4?
          </div>
        </div>
        <div className="flex justify-start">
          <div className="max-w-[90%] rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm leading-relaxed text-slate-200">
            Based on your strategy doc, the priorities are: (1) expand enterprise
            pilots, (2) ship the hybrid search upgrade, and (3) reduce onboarding
            time by 40%.
          </div>
        </div>
        <div className={`rounded-xl border border-violet-500/20 bg-violet-500/5 px-3 py-2 text-xs ${glassPanel}`}>
          <span className="font-medium text-violet-200">Sources</span>
          <span className="text-slate-500"> · Q4 Strategy.pdf (0.92)</span>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative flex h-full min-h-full w-full flex-col bg-slate-950 text-slate-100">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-slate-950">
        <div className="absolute -left-32 top-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/25 blur-[100px]" />
        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-[90px]" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-violet-500/10 blur-[80px]" />
        <DotGrid />
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-8">
          <Logo />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className={`hidden px-4 py-2 sm:inline-flex ${btnSecondary}`}>
              Sign in
            </Link>
            <Link href="/signup" className={`px-4 py-2 text-sm ${btnPrimary}`}>
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        {/* Hero — full viewport below nav */}
        <section className="flex min-h-[calc(100dvh-4.25rem)] flex-col justify-center">
          <div className="mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-12 md:px-8 lg:grid-cols-2 lg:gap-16 lg:py-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                RAG-powered document chat
              </p>
              <h1 className="mt-6 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                Chat with your{' '}
                <span className="bg-gradient-to-r from-violet-300 via-violet-100 to-cyan-300 bg-clip-text text-transparent">
                  documents
                </span>
                , not the whole internet
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
                Assistio is your intelligent workspace for grounded Q&amp;A. Upload files
                per conversation, search with hybrid RAG, and get answers backed by
                real citations.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/signup" className={`px-6 py-3 text-sm ${btnPrimary}`}>
                  Start free
                </Link>
                <Link href="/login" className={`px-6 py-3 text-sm ${btnSecondary}`}>
                  Sign in
                </Link>
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Free tokens included · No credit card required
              </p>
            </div>

            <div className="relative lg:pl-4">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-violet-600/20 to-cyan-600/10 blur-2xl" />
              <div className="relative">
                <ChatPreview />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="border-t border-white/5 bg-slate-900/30 py-20 md:py-28"
        >
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Built for focused, trustworthy answers
              </h2>
              <p className="mt-3 text-slate-400">
                Everything you need to turn static files into an interactive knowledge
                assistant — without leaving your private workspace.
              </p>
            </div>

            <div className="mt-12 grid gap-5 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <article
                  key={feature.title}
                  className={`group rounded-2xl p-6 transition hover:border-violet-400/30 hover:bg-slate-900/80 ${glassPanel}`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-300 transition group-hover:border-cyan-400/30 group-hover:bg-cyan-500/10 group-hover:text-cyan-300">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-slate-400">
              From signup to your first cited answer in minutes.
            </p>
          </div>

          <ol className="mt-14 grid gap-8 md:grid-cols-3">
            {STEPS.map((item) => (
              <li key={item.step} className="relative text-center md:text-left">
                <span className="bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24 md:px-8 md:pb-32">
          <div
            className={`relative overflow-hidden rounded-3xl px-8 py-14 text-center sm:px-12 ${glassPanel}`}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-600/15" />
            <div className="relative">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">
                Ready to talk to your documents?
              </h2>
              <p className="mx-auto mt-3 max-w-md text-slate-400">
                Join Assistio and turn PDFs, briefs, and notes into a searchable,
                conversational knowledge base.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/signup" className={`px-6 py-3 text-sm ${btnPrimary}`}>
                  Create free account
                </Link>
                <Link href="/login" className={`px-6 py-3 text-sm ${btnSecondary}`}>
                  I have an account
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-500 sm:flex-row md:px-8">
          <Logo className="opacity-80" />
          <p>© {new Date().getFullYear()} Assistio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
