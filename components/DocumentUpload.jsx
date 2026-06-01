'use client';

import { useState } from 'react';
import { getErrorMessage, isInsufficientTokensResponse } from '@/lib/utils/apiErrors.js';
import { btnPrimary, btnSecondary, glassPanelStrong, inputClass } from '@/lib/ui/theme.js';

export default function DocumentUpload({
  chatId,
  documents = [],
  tokensExhausted = false,
  onUploaded,
  onCreateChat,
  onTokensUpdate,
}) {
  const [expanded, setExpanded] = useState(false);
  const [text, setText] = useState('');
  const [source, setSource] = useState('');
  const [status, setStatus] = useState('');
  const [uploading, setUploading] = useState(false);

  const disabled = uploading || tokensExhausted;

  const ensureChatId = async () => {
    if (chatId) return chatId;
    if (!onCreateChat) return null;
    return onCreateChat();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (tokensExhausted) {
      setStatus('No tokens remaining. Uploads are paused.');
      return;
    }

    const activeChatId = await ensureChatId();
    if (!activeChatId) {
      setStatus('Select or create a chat first.');
      return;
    }

    setUploading(true);
    setStatus('Indexing document...');

    try {
      const form = new FormData();
      form.append('file', file);
      form.append('chatId', activeChatId);

      const res = await fetch('/api/documents/upload', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        if (isInsufficientTokensResponse(res.status, data) && data.tokens) {
          onTokensUpdate?.(data.tokens);
        }
        throw new Error(getErrorMessage(data));
      }

      if (data.tokens) onTokensUpdate?.(data.tokens);

      setStatus(
        `Indexed "${file.name}" (${data.chunkCount} chunks, ${data.tokensSpent} tokens used)`
      );
      onUploaded?.(activeChatId);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    if (tokensExhausted) {
      setStatus('No tokens remaining. Uploads are paused.');
      return;
    }

    const activeChatId = await ensureChatId();
    if (!activeChatId) {
      setStatus('Select or create a chat first.');
      return;
    }

    setUploading(true);
    setStatus('Indexing text...');

    try {
      const res = await fetch('/api/documents/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          source: source.trim() || 'Manual input',
          chatId: activeChatId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (isInsufficientTokensResponse(res.status, data) && data.tokens) {
          onTokensUpdate?.(data.tokens);
        }
        throw new Error(getErrorMessage(data));
      }

      if (data.tokens) onTokensUpdate?.(data.tokens);

      setStatus(`Indexed text (${data.chunkCount} chunks, ${data.tokensSpent} tokens used)`);
      setText('');
      setSource('');
      onUploaded?.(activeChatId);
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`border-b border-white/10 px-4 py-3 md:px-6 ${glassPanelStrong}`}>
      <div className="flex flex-wrap items-center gap-2">
        <label
          className={`inline-flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm font-medium text-white ${btnPrimary} ${
            disabled ? 'pointer-events-none opacity-50' : ''
          }`}
        >
          <input
            type="file"
            accept=".txt,.md,.json,.pdf,text/plain,text/markdown,application/pdf"
            onChange={handleFile}
            disabled={disabled}
            className="hidden"
          />
          <span>{uploading ? 'Uploading…' : 'Upload file'}</span>
        </label>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          disabled={tokensExhausted}
          className={`px-3.5 py-2 ${btnSecondary} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {expanded ? 'Hide paste' : 'Paste text'}
        </button>
        {documents.length > 0 && (
          <span className="text-xs text-violet-200/70">
            {documents.length} doc{documents.length !== 1 ? 's' : ''} in this chat
          </span>
        )}
      </div>

      {documents.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {documents.map((doc) => (
            <li
              key={doc.id}
              className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-xs text-violet-100"
              title={`${doc.chunkCount} chunks`}
            >
              {doc.source}
            </li>
          ))}
        </ul>
      )}

      {tokensExhausted && (
        <p className="mt-2 text-xs text-amber-200/90">
          Out of tokens — document uploads are paused.
        </p>
      )}

      {expanded && !tokensExhausted && (
        <form onSubmit={handleTextSubmit} className="mt-3 flex flex-col gap-2.5">
          <input
            type="text"
            placeholder="Source name (optional)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            disabled={uploading}
            className={inputClass}
          />
          <textarea
            placeholder="Paste document text here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            disabled={uploading}
            className={`${inputClass} resize-y`}
          />
          <button
            type="submit"
            disabled={uploading || !text.trim()}
            className={`self-start px-4 py-2 text-sm ${btnPrimary}`}
          >
            Add text
          </button>
        </form>
      )}

      {status && (
        <p className="mt-2 text-xs text-slate-400">{status}</p>
      )}
    </div>
  );
}
