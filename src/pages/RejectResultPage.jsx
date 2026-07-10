import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import ImageBlock from "../components/ImageBlock.jsx";
import ReplyCard from "../components/ReplyCard.jsx";
import ReplyInput from "../components/ReplyInput.jsx";
import ResultMessage from "../components/ResultMessage.jsx";

export default function RejectResultPage({ cardData, display, setCardData }) {
  const navigate = useNavigate();

  function submitReply(text) {
    setCardData({
      rejectReplyText: text,
      rejectReplySubmitted: true
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
