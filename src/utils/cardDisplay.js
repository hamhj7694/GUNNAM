export function getCardDisplay(cardData) {
  const displayAcceptButtonText =
    cardData.acceptButtonText.trim() || "좋아요";
  const displayRejectButtonText =
    cardData.rejectButtonText.trim() || "싫어요";

  return {
    displayAcceptButtonText,
    displayRejectButtonText,
    finalAcceptMessage:
      cardData.acceptResultText.trim() || displayAcceptButtonText,
    finalRejectMessage:
      cardData.rejectResultText.trim() || displayRejectButtonText
  };
}
