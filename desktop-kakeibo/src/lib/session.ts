const KEY = 'kakeibo.sessionUserId';

export function getSessionUserId() {
  return localStorage.getItem(KEY) || '';
}

export function setSessionUserId(userId: string) {
  localStorage.setItem(KEY, userId);
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

