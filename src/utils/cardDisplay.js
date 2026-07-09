export function getCardDisplay(cardData) {
  const normalizedAcceptText = cardData.acceptButtonText.trim();
  const normalizedRejectText = cardData.rejectButtonText.trim();
  const displayAcceptButtonText =
    normalizedAcceptText || "좋아요";
  const displayRejectButtonText =
    normalizedRejectText || "싫어요";

  return {
    displayAcceptButtonText,
    displayRejectButtonText,
    finalAcceptMessage:
      cardData.acceptResultText?.trim() || displayAcceptButtonText,
    finalRejectMessage:
      cardData.rejectResultText?.trim() || displayRejectButtonText
  };
}
