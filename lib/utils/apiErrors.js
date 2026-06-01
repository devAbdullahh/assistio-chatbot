export function getErrorMessage(data, fallback = 'Request failed') {
  if (data?.code === 'INSUFFICIENT_TOKENS') {
    return data.error;
  }
  if (data?.code === 'GEMINI_UNAVAILABLE') {
    return data.error;
  }
  if (data?.code === 'GEMINI_RATE_LIMIT') {
    return data.error;
  }
  return data?.error || fallback;
}

export function isInsufficientTokensResponse(status, data) {
  return status === 402 || data?.code === 'INSUFFICIENT_TOKENS';
}

export function isGeminiUnavailableResponse(status, data) {
  return status === 503 || data?.code === 'GEMINI_UNAVAILABLE';
}

export function isRetryableChatError(status, data) {
  return (
    isGeminiUnavailableResponse(status, data) ||
    status === 429 ||
    data?.code === 'GEMINI_RATE_LIMIT' ||
    status === 502 ||
    status === 504
  );
}
