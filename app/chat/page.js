'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Chat from '@/components/Chat';
import ChatSidebar from '@/components/ChatSidebar';
import { btnGhost } from '@/lib/ui/theme.js';

const LG_BREAKPOINT = '(min-width: 1024px)';

export default function ChatAppPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(LG_BREAKPOINT);
    const syncSidebar = () => setSidebarOpen(mq.matches);
    syncSidebar();
    mq.addEventListener('change', syncSidebar);
    return () => mq.removeEventListener('change', syncSidebar);
  }, []);

  const closeSidebarOnMobile = useCallback(() => {
    if (!window.matchMedia(LG_BREAKPOINT).matches) {
      setSidebarOpen(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Failed to load stats');
    const data = await res.json();
    setStats(data);
    if (data.tokens) setTokens(data.tokens);
    return data;
  }, []);

  const loadChats = useCallback(async () => {
    setChatsLoading(true);
    try {
      const res = await fetch('/api/chats');
      if (!res.ok) throw new Error('Failed to load chats');
      const data = await res.json();
      setChats(data.chats || []);
    } finally {
      setChatsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          router.push('/login');
          return;
        }
        const { user: me } = await meRes.json();
        setUser(me);
        if (me.tokens) setTokens(me.tokens);
        await Promise.all([refreshStats(), loadChats()]);
        setError('');
      } catch {
        setError('Failed to load app. Check your connection and .env.local');
      }
    }
    init();
  }, [router, refreshStats, loadChats]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const handleNewChat = async () => {
    const res = await fetch('/api/chats', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setActiveChatId(data.id);
      await loadChats();
      closeSidebarOnMobile();
      return data.id;
    }
    return null;
  };

  const handleDeleteChat = async (id) => {
    await fetch(`/api/chats/${id}`, { method: 'DELETE' });
    if (activeChatId === id) setActiveChatId(null);
    await Promise.all([loadChats(), refreshStats()]);
  };

  const tokensExhausted = tokens?.exhausted ?? false;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-slate-950">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-72 w-72 rounded-full bg-violet-600/15 blur-[100px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px]" />
      </div>

      <header
        className={`relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-900/80 px-6 py-5 backdrop-blur-xl md:px-8`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className={`${btnGhost} lg:hidden`}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Close chat list' : 'Open chat list'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              {sidebarOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className={`${btnGhost} hidden lg:inline-flex`}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 text-sm font-bold text-white shadow-md shadow-violet-500/20">
              A
            </div>
            <h1 className="truncate bg-gradient-to-r from-white to-slate-300 bg-clip-text text-xl font-semibold text-transparent md:text-2xl">
              Assistio
            </h1>
          </div>
        </div>
        {stats?.model && (
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-200">
            {stats.model}
          </span>
        )}
      </header>

      {tokensExhausted && (
        <div className="relative z-10 shrink-0 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-100 backdrop-blur-sm md:px-6">
          You have no tokens remaining. Chat messages and document uploads are paused until
          you receive more tokens.
        </div>
      )}

      {error && (
        <div className="relative z-10 shrink-0 border-b border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200 backdrop-blur-sm md:px-6">
          {error}
        </div>
      )}

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <button
          type="button"
          className={`absolute inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out lg:hidden ${
            sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          aria-label="Close chat list"
          aria-hidden={!sidebarOpen}
          tabIndex={sidebarOpen ? 0 : -1}
          onClick={() => setSidebarOpen(false)}
        />

        <aside
          className={`absolute inset-y-0 left-0 z-40 flex h-full overflow-hidden border-white/10 bg-slate-900/90 backdrop-blur-xl transition-[width,transform,border-color] duration-300 ease-in-out lg:static lg:z-auto lg:translate-x-0 ${
            sidebarOpen
              ? 'w-[min(280px,85vw)] translate-x-0 border-r lg:w-[220px]'
              : 'w-[min(280px,85vw)] -translate-x-full border-r lg:w-0 lg:border-r-0'
          }`}
          aria-hidden={!sidebarOpen}
        >
          <div
            className={`flex h-full w-[min(280px,85vw)] flex-col p-4 transition-opacity duration-300 ease-in-out lg:w-[220px] ${
              sidebarOpen ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <ChatSidebar
              chats={chats}
              chatsLoading={chatsLoading}
              activeChatId={activeChatId}
              user={user}
              tokens={tokens}
              tokensExhausted={tokensExhausted}
              onSelect={(id) => {
                setActiveChatId(id);
                closeSidebarOnMobile();
              }}
              onNew={handleNewChat}
              onDelete={handleDeleteChat}
              onLogout={handleLogout}
            />
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <Chat
            chatId={activeChatId}
            tokens={tokens}
            tokensExhausted={tokensExhausted}
            onCreateChat={handleNewChat}
            onTokensUpdate={setTokens}
            onChatIdChange={async (id) => {
              setActiveChatId(id);
              await Promise.all([loadChats(), refreshStats()]);
            }}
          />
        </section>
      </div>
    </div>
  );
}
