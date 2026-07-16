export const LINK_CARD_HISTORY_STORAGE_KEY = "gunnam.linkCardHistory.v1";

function getStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function isSafeCardUrl(value, type) {
  try {
    const url = new URL(value);
    if (typeof window !== "undefined" && url.origin !== window.location.origin) {
      return false;
    }
    if (type === "share") {
      return /^\/gunnam\/c\/s_[A-Za-z0-9_-]{43}$/.test(url.pathname);
    }
    return url.pathname === "/gunnam/manage" && /^#token=m_[A-Za-z0-9_-]{43}$/.test(url.hash);
  } catch {
    return false;
  }
}

function isValidItem(item) {
  return Boolean(
    item &&
      typeof item.id === "string" &&
      typeof item.questionText === "string" &&
      typeof item.shareUrl === "string" &&
      typeof item.managementUrl === "string" &&
      isSafeCardUrl(item.shareUrl, "share") &&
      isSafeCardUrl(item.managementUrl, "management") &&
      typeof item.createdAt === "string"
  );
}

export function loadLinkCardHistory() {
  try {
    const saved = getStorage()?.getItem(LINK_CARD_HISTORY_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter(isValidItem).slice(0, 50) : [];
  } catch (error) {
    console.warn("링크 카드 히스토리를 불러오지 못했습니다.", error);
    return [];
  }
}

export function saveLinkCardHistory(history) {
  try {
    getStorage()?.setItem(
      LINK_CARD_HISTORY_STORAGE_KEY,
      JSON.stringify(history.slice(0, 50))
    );
    return true;
  } catch (error) {
    console.warn("링크 카드 히스토리를 저장하지 못했습니다.", error);
    return false;
  }
}

export function createLinkCardHistoryItem(result) {
  const card = result?.card || {};
  return {
    id: String(card.id || globalThis.crypto?.randomUUID?.() || Date.now()),
    questionText: String(card.questionText || ""),
    shareUrl: String(result?.shareUrl || ""),
    managementUrl: String(result?.managementUrl || ""),
    createdAt: String(card.createdAt || new Date().toISOString())
  };
}
