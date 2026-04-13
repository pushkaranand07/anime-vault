const USER_KEY = 'anivault_user_id';
const RECENT_USERS_KEY = 'anivault_recent_users';

export function getUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_KEY);
}

export function setUserId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, id);
  // Also save to cookies for SSR potential usage
  document.cookie = `user_id=${id}; path=/; max-age=31536000`;
  
  // Add to recent
  const recent = getRecentUsers();
  const updated = [id, ...recent.filter(u => u !== id)].slice(0, 5);
  localStorage.setItem(RECENT_USERS_KEY, JSON.stringify(updated));
}

export function clearUserId() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(USER_KEY);
  document.cookie = `user_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function getRecentUsers(): string[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(RECENT_USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}
