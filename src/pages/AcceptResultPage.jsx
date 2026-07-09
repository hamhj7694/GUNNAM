import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import ImageBlock from "../components/ImageBlock.jsx";
import ReplyCard from "../components/ReplyCard.jsx";
import ReplyInput from "../components/ReplyInput.jsx";
import ResultMessage from "../components/ResultMessage.jsx";

export default function AcceptResultPage({ cardData, display, setCardData }) {
  const navigate = useNavigate();

  function submitReply(text) {
    setCardData({
      acceptReplyText: text,
      acceptReplySubmitted: true
    });
  }

  return (
    <CardFrame className="result-page accept-result accept-context">
      <div className="result-preview accept-preview">
        <ImageBlock image={cardData.acceptImage} alt="수락 후 이미지" />
        <ResultMessage>{display.finalAcceptMessage}</ResultMessage>
      </div>
      {cardData.acceptReplySubmitted ? (
        <ReplyCard text={cardData.acceptReplyText} />
      ) : null}
      {cardData.acceptReplyEnabled ? (
        <ReplyInput value={cardData.acceptReplyText} onSubmit={submitReply} />
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
