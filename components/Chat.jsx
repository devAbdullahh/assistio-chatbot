'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import DocumentUpload from '@/components/DocumentUpload';
import { getErrorMessage, isInsufficientTokensResponse } from '@/lib/utils/apiErrors.js';
import {
  btnPrimary,
  glassPanel,
  inputClass,
  scrollbarTheme,
  skeletonBar,
  skeletonBarMuted,
} from '@/lib/ui/theme.js';

function ChatMessagesSkeleton() {
  return (
    <>
      <div className="flex justify-start" aria-hidden>
        <div className="w-[min(75%,20rem)] space-y-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3">
          <div className={`h-3 w-full ${skeletonBar}`} />
          <div className={`h-3 w-[92%] ${skeletonBarMuted}`} />
          <div className={`h-3 w-[70%] ${skeletonBarMuted}`} />
        </div>
      </div>
      <div className="flex justify-end" aria-hidden>
        <div className={`h-10 w-48 rounded-2xl rounded-br-md ${skeletonBar}`} />
      </div>
      <div className="flex justify-start" aria-hidden>
        <div className="w-[min(75%,18rem)] space-y-2 rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3">
          <div className={`h-3 w-full ${skeletonBar}`} />
          <div className={`h-3 w-[80%] ${skeletonBarMuted}`} />
        </div>
      </div>
    </>
  );
}

const WELCOME = {
  role: 'assistant',
  content:
    'Hi! Upload documents for this chat, then ask questions. Assistio only uses files attached to this conversation.',
};

export default function Chat({
  chatId,
  tokens,
  tokensExhausted,
  onChatIdChange,
  onCreateChat,
  onTokensUpdate,
}) {
  const [messages, setMessages] = useState([WELCOME]);
  const [documents, setDocuments] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [sources, setSources] = useState([]);
  const bottomRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior });
      return;
    }
    bottomRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  const loadChat = useCallback(async () => {
    if (!chatId) {
      setChatLoading(false);
      setMessages([WELCOME]);
      setDocuments([]);
      setSources([]);
      return;
    }

    setChatLoading(true);
    try {
      const res = await fetch(`/api/chats/${chatId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages(data.messages.length > 0 ? data.messages : [WELCOME]);
      setDocuments(data.documents || []);
      setSources([]);
    } catch {
      setMessages([WELCOME]);
      setDocuments([]);
    } finally {
      setChatLoading(false);
    }
  }, [chatId]);

  useLayoutEffect(() => {
    if (chatId) setChatLoading(true);
  }, [chatId]);

  useEffect(() => {
    loadChat();
  }, [loadChat]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => scrollToBottom());
    return () => cancelAnimationFrame(frame);
  }, [messages, loading, scrollToBottom]);

  const handleCreateChat = async () => {
    if (onCreateChat) {
      const id = await onCreateChat();
      return id;
    }
    const res = await fetch('/api/chats', { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      onChatIdChange?.(data.id);
      return data.id;
    }
    return null;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading || tokensExhausted) return;

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setSources([]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, chatId: chatId || undefined }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (isInsufficientTokensResponse(res.status, data) && data.tokens) {
          onTokensUpdate?.(data.tokens);
        }
        throw new Error(getErrorMessage(data, 'Chat request failed'));
      }

      if (data.tokens) onTokensUpdate?.(data.tokens);

      if (data.chatId && data.chatId !== chatId) {
        onChatIdChange?.(data.chatId);
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.answer },
      ]);
      setSources(data.sources || []);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: err.message, isNotice: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0">
        <DocumentUpload
          chatId={chatId}
          documents={documents}
          tokensExhausted={tokensExhausted}
          onCreateChat={handleCreateChat}
          onTokensUpdate={onTokensUpdate}
          onUploaded={(id) => {
            if (id && id !== chatId) onChatIdChange?.(id);
            loadChat();
          }}
        />
      </div>

      <div
        ref={messagesContainerRef}
        className={`min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 md:px-8 ${scrollbarTheme}`}
      >
        <div className="flex flex-col gap-4" aria-busy={chatLoading}>
          {chatLoading ? (
            <ChatMessagesSkeleton />
          ) : (
            messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] whitespace-pre-wrap rounded-2xl px-4 py-3 leading-relaxed ${
                  msg.role === 'user'
                    ? 'rounded-br-md bg-gradient-to-br from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-600/20'
                    : msg.isNotice
                      ? 'rounded-bl-md border border-amber-500/40 bg-amber-500/10 text-amber-100'
                      : 'rounded-bl-md border border-white/10 bg-white/5 text-slate-100 backdrop-blur-sm'
                }`}
              >
                {msg.isNotice && (
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-amber-300/90">
                    Could not get a reply
                  </span>
                )}
                {msg.content}
              </div>
            </div>
            ))
          )}
          {!chatLoading && loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/5 px-4 py-3 text-sm italic text-violet-200/80 backdrop-blur-sm">
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Thinking…
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {sources.length > 0 && (
        <div className={`mx-6 mb-2 shrink-0 rounded-xl px-4 py-3 text-sm md:mx-8 ${glassPanel}`}>
          <strong className="text-violet-200">Sources used</strong>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            {sources.map((src, i) => (
              <li key={i} className="text-slate-400">
                <span className="text-cyan-300">{src.source}</span>
                <span className="ml-1 text-slate-500">({src.score})</span>
                <p className="mt-0.5 text-slate-500">{src.excerpt}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tokensExhausted && (
        <p className="mx-6 mb-2 shrink-0 text-sm text-amber-200/90 md:mx-8">
          Out of tokens — you cannot send messages until your balance is restored.
        </p>
      )}

      <form
        onSubmit={sendMessage}
        className="flex shrink-0 gap-3 border-t border-white/10 bg-slate-900/80 px-6 py-4 backdrop-blur-xl md:px-8"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            tokensExhausted
              ? 'No tokens remaining…'
              : "Ask about this chat's documents..."
          }
          disabled={loading || chatLoading || tokensExhausted}
          className={`flex-1 ${inputClass}`}
        />
        <button
          type="submit"
          disabled={loading || chatLoading || !input.trim() || tokensExhausted}
          className={`shrink-0 px-5 py-2.5 text-sm ${btnPrimary}`}
        >
          Send
        </button>
      </form>
    </div>
  );
}
