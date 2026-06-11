const STORAGE_KEY = 'chatwave_anonymous_id';

function generateId(): string {
  let result = 'wave_';
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  for (const byte of array) result += chars[byte % chars.length];
  return result;
}

export function getOrCreateAnonymousId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing && /^wave_[a-z0-9]{8}$/.test(existing)) return existing;
    const fresh = generateId();
    localStorage.setItem(STORAGE_KEY, fresh);
    return fresh;
  } catch {
    return generateId();
  }
}

export function isValidAnonymousId(id: unknown): id is string {
  return typeof id === 'string' && /^wave_[a-z0-9]{8}$/.test(id);
}
