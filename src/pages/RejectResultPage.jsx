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
      <div className="result-preview reject-preview">
        <ImageBlock image={cardData.rejectImage} alt="거절 후 이미지" />
        <ResultMessage>{display.finalRejectMessage}</ResultMessage>
      </div>
      {cardData.rejectReplySubmitted ? (
        <ReplyCard text={cardData.rejectReplyText} />
      ) : null}
      {cardData.rejectReplyEnabled ? (
        <ReplyInput value={cardData.rejectReplyText} onSubmit={submitReply} />
      ) : null}
      <button
        className="screen-back-button"
        type="button"
        aria-label="카드로 돌아가기"
        onClick={() => navigate("/show")}
      >
        ←
      </button>
    </CardFrame>
  );
}
