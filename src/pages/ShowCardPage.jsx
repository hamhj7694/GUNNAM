import { useNavigate } from "react-router-dom";
import ActionButtons from "../components/ActionButtons.jsx";
import CardFrame from "../components/CardFrame.jsx";
import MainQuestionCard from "../components/MainQuestionCard.jsx";

export default function ShowCardPage({ cardData, display }) {
  const navigate = useNavigate();

  return (
    <CardFrame className="show-page">
      <p>당신에게 건넵니다. 대답해 주세요.</p>
      <button
        aria-label="카드 작성 화면으로 돌아가기"
        className="screen-back-button"
        type="button"
        onClick={() => navigate("/create")}
      >
        <span aria-hidden="true">←</span>
      </button>
      <MainQuestionCard image={cardData.mainImage} text={cardData.mainText} />
      <ActionButtons
        acceptText={display.displayAcceptButtonText}
        rejectText={display.displayRejectButtonText}
        onAccept={() => navigate("/result/accept")}
        onReject={() => navigate("/result/reject")}
      />
    </CardFrame>
  );
}
