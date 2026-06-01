'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  btnSecondary,
  glassPanel,
  scrollbarTheme,
  skeletonBar,
  skeletonBarMuted,
} from '@/lib/ui/theme.js';

const CHAT_SKELETON_COUNT = 6;

function ChatListSkeleton() {
  return (
    <>
      {Array.from({ length: CHAT_SKELETON_COUNT }, (_, i) => (
        <li key={i} className="rounded-xl px-2.5 py-2.5" aria-hidden>
          <div className={`h-4 ${skeletonBar}`} style={{ width: `${68 - i * 6}%` }} />
          <div className={`mt-2 h-3 w-full ${skeletonBarMuted}`} />
        </li>
      ))}
    </>
  );
}

function SidebarFooterSkeleton() {
  return (
    <>
      <div className={`mb-3 rounded-xl px-3 py-2.5 ${glassPanel}`}>
        <div className="flex justify-between gap-2">
          <div className={`h-3 w-16 ${skeletonBar}`} />
          <div className={`h-3 w-12 ${skeletonBarMuted}`} />
        </div>
        <div className={`mt-2 h-1.5 w-full rounded-full ${skeletonBarMuted}`} />
      </div>
      <div className="mb-3">
        <div className={`h-4 w-28 ${skeletonBar}`} />
        <div className={`mt-2 h-3 w-36 ${skeletonBarMuted}`} />
      </div>
      <div className={`h-10 w-full rounded-xl ${skeletonBarMuted}`} />
    </>
  );
}

export default function ChatSidebar({
  chats,
  chatsLoading = false,
  activeChatId,
  user,
  tokens,
  tokensExhausted,
  onSelect,
  onNew,
  onDelete,
  onLogout,
}) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tokenPercent =
    tokens && tokens.granted > 0
      ? Math.min(100, Math.round((tokens.balance / tokens.granted) * 100))
      : 0;

  useEffect(() => {
    if (!pendingDelete) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape' && !deleting) setPendingDelete(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingDelete, deleting]);

  const handleConfirmDelete = async () => {
    if (!pendingDelete || deleting) return;

    setDeleting(true);
    try {
      await onDelete(pendingDelete.id);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex h-full min-h-0 flex-col">
        <button
          type="button"
          onClick={onNew}
          className="shrink-0 w-full rounded-xl border border-dashed border-violet-500/40 py-2.5 text-sm font-medium text-violet-300 transition hover:border-violet-400/60 hover:bg-violet-500/10"
        >
          + New chat
        </button>

        <ul
          className={`mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain ${scrollbarTheme}`}
          aria-busy={chatsLoading}
          aria-label="Chat list"
        >
          {chatsLoading && chats.length === 0 && <ChatListSkeleton />}
          {!chatsLoading && chats.length === 0 && (
            <li className="px-2 py-2 text-sm text-slate-500">No chats yet</li>
          )}
          {chats.map((chat) => (
            <li
              key={chat.id}
              className={`flex overflow-hidden rounded-xl transition ${
                chat.id === activeChatId
                  ? 'border border-violet-500/50 bg-violet-500/15 shadow-sm shadow-violet-500/10'
                  : 'border border-transparent hover:border-white/10 hover:bg-white/5'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(chat.id)}
                className="min-w-0 flex-1 px-2.5 py-2 text-left"
              >
                <span className="block truncate text-sm font-medium text-slate-100">
                  {chat.title}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {chat.preview}
                </span>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPendingDelete({ id: chat.id, title: chat.title });
                }}
                title="Delete chat"
                className="shrink-0 px-2 text-slate-500 transition hover:text-red-300"
              >
                ×
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-3 shrink-0 border-t border-white/10 pt-3">
          {chatsLoading && !user ? (
            <SidebarFooterSkeleton />
          ) : (
            <>
          {tokens && (
            <div
              className={`mb-3 rounded-xl px-3 py-2.5 ${glassPanel}`}
              title={`${tokens.used.toLocaleString()} tokens used of ${tokens.granted.toLocaleString()} granted`}
            >
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={tokensExhausted ? 'text-red-300' : 'text-violet-200'}>
                  {tokens.balance.toLocaleString()} left
                </span>
                <span className="text-slate-500">
                  / {tokens.granted.toLocaleString()}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all ${
                    tokensExhausted
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-violet-500 to-cyan-500'
                  }`}
                  style={{ width: `${tokenPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="mb-3 min-w-0">
            <p className="truncate text-sm font-medium text-slate-100">
              {user?.name || 'Account'}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || 'Loading...'}
            </p>
          </div>

          <button type="button" onClick={onLogout} className={`w-full py-2.5 ${btnSecondary}`}>
            Log out
          </button>
            </>
          )}
        </div>
      </div>

      {mounted &&
        pendingDelete &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-chat-title"
            onClick={() => {
              if (!deleting) setPendingDelete(null);
            }}
          >
            <div
              className={`w-full max-w-md rounded-2xl p-6 shadow-2xl shadow-black/40 ${glassPanel}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="delete-chat-title" className="text-lg font-semibold text-white">
                Delete chat?
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                <span className="font-medium text-slate-200">
                  &ldquo;{pendingDelete.title}&rdquo;
                </span>{' '}
                and all of its messages will be permanently removed. Uploaded documents
                for this chat will also be deleted from your knowledge base.
              </p>
              <p className="mt-2 text-sm text-red-300">This action cannot be undone.</p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setPendingDelete(null)}
                  className={`px-4 py-2 ${btnSecondary}`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? 'Deleting…' : 'Delete chat'}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
