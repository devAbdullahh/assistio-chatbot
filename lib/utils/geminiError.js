export function getGeminiErrorStatus(error) {
  if (typeof error?.status === 'number') return error.status;
  const match = String(error?.message ?? '').match(/\[(\d{3})\s[^\]]*\]/);
  return match ? Number(match[1]) : undefined;
}

export function getGeminiErrorCode(error) {
  const status = getGeminiErrorStatus(error);
  const message = String(error?.message ?? '').toLowerCase();

  if (status === 429) return 'GEMINI_RATE_LIMIT';
  if (status === 503 || message.includes('high demand') || message.includes('unavailable')) {
    return 'GEMINI_UNAVAILABLE';
  }
  if (status === 401 || status === 403) return 'GEMINI_AUTH';
  return 'GEMINI_ERROR';
}

export function getGeminiHttpStatus(error) {
  const status = getGeminiErrorStatus(error);
  if (status === 429) return 429;
  if (status === 503) return 503;
  if (status === 401 || status === 403) return status;
  return 500;
}

export function formatGeminiError(error) {
  const message = error?.message || 'Unknown Gemini API error';
  const status = getGeminiErrorStatus(error);
  const lower = message.toLowerCase();

  if (status === 429) {
    if (message.includes('limit: 0')) {
      return (
        'Gemini free tier is not active for this API key (quota limit is 0). ' +
        'Create a new key at https://aistudio.google.com/apikey and set GEMINI_API_KEY in .env.local'
      );
    }
    return 'Too many requests to the AI service. Please wait a minute and try again.';
  }

  if (
    status === 503 ||
    lower.includes('high demand') ||
    lower.includes('service unavailable') ||
    lower.includes('overloaded')
  ) {
    return 'The AI model is busy due to high demand. Please wait a moment and try again.';
  }

  if (status === 401 || status === 403) {
    return 'Invalid Gemini API key. Check GEMINI_API_KEY in .env.local';
  }

  if (status === 500 || status === 502 || status === 504) {
    return 'The AI service had a temporary problem. Please try again in a few moments.';
  }

  // Strip noisy SDK prefix if present
  return message.replace(/^\[GoogleGenerativeAI Error\]:\s*/i, '').trim() || message;
}
