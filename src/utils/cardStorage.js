import { initialCardData } from "../data/cardData.js";

export const CARD_STORAGE_KEY = "gunnam.cardData.v1";

function getStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function loadCardData() {
  try {
    const savedCardData = getStorage()?.getItem(CARD_STORAGE_KEY);

    if (!savedCardData) {
      return { ...initialCardData };
    }

    const parsedCardData = JSON.parse(savedCardData);

    if (
      !parsedCardData ||
      typeof parsedCardData !== "object" ||
      Array.isArray(parsedCardData)
    ) {
      return { ...initialCardData };
    }

    return {
      ...initialCardData,
      ...parsedCardData
    };
  } catch (error) {
    console.warn("저장된 카드 데이터를 불러오지 못했습니다.", error);
    return { ...initialCardData };
  }
}

export function saveCardData(cardData) {
  try {
    getStorage()?.setItem(CARD_STORAGE_KEY, JSON.stringify(cardData));
    return true;
  } catch (error) {
    console.warn("카드 데이터를 브라우저에 저장하지 못했습니다.", error);
    return false;
  }
}

export function clearCardData() {
  try {
    getStorage()?.removeItem(CARD_STORAGE_KEY);
  } catch (error) {
    console.warn("저장된 카드 데이터를 삭제하지 못했습니다.", error);
  }
}
