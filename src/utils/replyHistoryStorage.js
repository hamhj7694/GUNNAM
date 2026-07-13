export const REPLY_HISTORY_STORAGE_KEY = "gunnam.replyHistory.v1";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function loadReplyHistory() {
  try {
    const savedHistory = getStorage()?.getItem(REPLY_HISTORY_STORAGE_KEY);
    const parsedHistory = savedHistory ? JSON.parse(savedHistory) : [];

    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.replyText === "string" &&
        item.replyText.trim()
    );
  } catch (error) {
    console.warn("받은 답변 히스토리를 불러오지 못했습니다.", error);
    return [];
  }
}

export function saveReplyHistory(history) {
  try {
    getStorage()?.setItem(REPLY_HISTORY_STORAGE_KEY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.warn("받은 답변 히스토리를 저장하지 못했습니다.", error);
    return false;
  }
}

export function createReplyHistoryId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `reply-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
