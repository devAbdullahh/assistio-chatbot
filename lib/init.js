import { bootstrap } from './bootstrap.js';

let readyPromise = null;

export function ensureReady() {
  if (!readyPromise) readyPromise = bootstrap();
  return readyPromise;
}
