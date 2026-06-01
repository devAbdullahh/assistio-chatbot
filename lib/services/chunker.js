export const MAX_RECORD_BYTES = 15000;
export const TARGET_CHUNK_BYTES = 1800;

export function chunkText(text, maxBytes = TARGET_CHUNK_BYTES, overlapLines = 2) {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const lines = normalized.split('\n');
  const chunks = [];
  let buffer = [];

  const byteLength = (linesSlice) =>
    Buffer.byteLength(linesSlice.join('\n'), 'utf8');

  const flush = () => {
    const chunk = buffer.join('\n').trim();
    if (chunk) chunks.push(chunk);
  };

  const pushLongLine = (line) => {
    let remaining = line;
    while (remaining.length > 0) {
      let slice = remaining;
      const cap = Math.min(maxBytes, MAX_RECORD_BYTES);
      while (Buffer.byteLength(slice, 'utf8') > cap && slice.length > 1) {
        slice = slice.slice(0, Math.floor(slice.length * 0.85));
      }
      chunks.push(slice.trim());
      remaining = remaining.slice(slice.length).trimStart();
    }
  };

  for (const line of lines) {
    const lineBytes = Buffer.byteLength(line, 'utf8');
    if (lineBytes > maxBytes) {
      if (buffer.length > 0) {
        flush();
        buffer = [];
      }
      pushLongLine(line);
      continue;
    }

    const nextBytes =
      byteLength(buffer.length ? [...buffer, line] : [line]) +
      (buffer.length ? 1 : 0);

    if (buffer.length > 0 && nextBytes > maxBytes) {
      flush();
      buffer = buffer.slice(Math.max(0, buffer.length - overlapLines));
    }

    buffer.push(line);
  }

  if (buffer.length > 0) flush();

  return chunks;
}
