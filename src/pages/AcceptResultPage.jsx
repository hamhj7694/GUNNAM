import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import ImageBlock from "../components/ImageBlock.jsx";
import ReplyCard from "../components/ReplyCard.jsx";
import ReplyInput from "../components/ReplyInput.jsx";
import ResultMessage from "../components/ResultMessage.jsx";

export default function AcceptResultPage({
  cardData,
  display,
  setCardData,
  recordReply
}) {
  const navigate = useNavigate();

  function submitReply(text) {
    const historyId = recordReply({
      historyId: cardData.acceptReplyHistoryId,
      responseType: "accept",
      replyText: text,
      resultText: display.finalAcceptMessage
    });

    setCardData({
      acceptReplyText: text,
      acceptReplySubmitted: true,
      acceptReplyHistoryId: historyId
    });
  }

  function resetReply() {
    setCardData({
      acceptReplyText: "",
      acceptReplySubmitted: false,
      acceptReplyHistoryId: null
    });
  }

  return (
    <CardFrame className="result-page accept-result accept-context">
      <button
        aria-label="카드로 돌아가기"
        className="screen-back-button"
        type="button"
        onClick={() => navigate("/show")}
      >
        <span aria-hidden="true">←</span>
      </button>
      <button
        aria-label="수락 답변 초기화"
        className="reply-reset-button"
        type="button"
        onClick={resetReply}
      >
        답변
        <br />
        초기화
      </button>
      <div className="result-preview">
        <ImageBlock image={cardData.acceptImage} alt="수락 결과" />
        <ResultMessage>{display.finalAcceptMessage}</ResultMessage>
      </div>
      {cardData.acceptReplySubmitted ? (
        <ReplyCard text={cardData.acceptReplyText} />
      ) : null}
      {cardData.acceptReplyEnabled ? (
        <ReplyInput
          submitted={cardData.acceptReplySubmitted}
          value={cardData.acceptReplyText}
          onSubmit={submitReply}
        />
      ) : null}
    </CardFrame>
  );
}
