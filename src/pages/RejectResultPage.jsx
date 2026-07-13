import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import ImageBlock from "../components/ImageBlock.jsx";
import ReplyCard from "../components/ReplyCard.jsx";
import ReplyInput from "../components/ReplyInput.jsx";
import ResultMessage from "../components/ResultMessage.jsx";

export default function RejectResultPage({
  cardData,
  display,
  setCardData,
  recordReply
}) {
  const navigate = useNavigate();

  function submitReply(text) {
    const historyId = recordReply({
      historyId: cardData.rejectReplyHistoryId,
      responseType: "reject",
      replyText: text,
      resultText: display.finalRejectMessage
    });

    setCardData({
      rejectReplyText: text,
      rejectReplySubmitted: true,
      rejectReplyHistoryId: historyId
    });
  }

  function resetReply() {
    setCardData({
      rejectReplyText: "",
      rejectReplySubmitted: false,
      rejectReplyHistoryId: null
    });
  }

  return (
    <CardFrame className="result-page reject-result reject-context">
      <button
        aria-label="카드로 돌아가기"
        className="screen-back-button"
        type="button"
        onClick={() => navigate("/show")}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        aria-label="거절 답변 초기화"
        className="reply-reset-button"
        type="button"
        onClick={resetReply}
      >
        답변
        <br />
        초기화
      </button>
      <div className="result-preview">
        <ImageBlock image={cardData.rejectImage} alt="거절 결과" />
        <ResultMessage>{display.finalRejectMessage}</ResultMessage>
      </div>
      {cardData.rejectReplySubmitted ? (
        <ReplyCard text={cardData.rejectReplyText} />
      ) : null}
      {cardData.rejectReplyEnabled ? (
        <ReplyInput
          submitted={cardData.rejectReplySubmitted}
          value={cardData.rejectReplyText}
          onSubmit={submitReply}
        />
      ) : null}
    </CardFrame>
  );
}
