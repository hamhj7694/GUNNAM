import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import ImageBlock from "../components/ImageBlock.jsx";
import ImageUploader from "../components/ImageUploader.jsx";
import ReplyInput from "../components/ReplyInput.jsx";
import ToggleSwitch from "../components/ToggleSwitch.jsx";

const steps = [
  { id: "main", label: "메인 카드" },
  { id: "accept", label: "수락 페이지" },
  { id: "reject", label: "거절 페이지" }
];

export default function CreateCardPage({ cardData, display, setCardData }) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const step = steps[stepIndex];

  function updateField(field, value) {
    setCardData({ [field]: value });
  }

  function validateMainCard() {
    if (!cardData.mainText.trim()) {
      setError("상대에게 보여줄 내용을 적어주세요.");
      setStepIndex(0);
      return false;
    }

    setError("");
    return true;
  }

  function goNext() {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function goPrevious() {
    if (stepIndex === 0) {
      navigate("/");
      return;
    }

    setStepIndex((current) => current - 1);
  }

  function showCard() {
    if (!validateMainCard()) {
      return;
    }

    navigate("/show");
  }

  return (
    <CardFrame
      className={`edit-page ${step.id === "accept" ? "accept-context" : ""} ${
        step.id === "reject" ? "reject-context" : ""
      }`}
    >
      <header className="page-header">
        <p className="eyebrow">카드 작성</p>
        <h1>보일 화면을 직접 만들어요</h1>
      </header>

      <nav className="step-tabs" aria-label="작성 단계">
        {steps.map((item, index) => (
          <button
            className={index === stepIndex ? "is-active" : ""}
            key={item.id}
            type="button"
            onClick={() => {
              setError("");
              setStepIndex(index);
            }}
          >
            <span>{index + 1}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {step.id === "main" ? (
        <section className="creator-step">
          <div className="screen-preview">
            <div className="section-label">
              <span>{step.label}</span>
              <span>상대 화면</span>
            </div>
            <article className="question-card editable-question-card">
              {cardData.mainImage ? (
                <img src={cardData.mainImage} alt="메인 카드 이미지" />
              ) : null}
              <textarea
                aria-label="메인 카드 문구"
                rows="4"
                value={cardData.mainText}
                onChange={(event) => updateField("mainText", event.target.value)}
                placeholder={"상대에게 보여줄\n문구를 입력하세요."}
              />
            </article>
            <div className="editable-action-buttons">
              <input
                className="button-input accept-input"
                aria-label="수락 버튼 문구"
                value={cardData.acceptButtonText}
                onChange={(event) => updateField("acceptButtonText", event.target.value)}
                placeholder="좋아요(직접 입력해보세요)"
              />
              <input
                className="button-input reject-input"
                aria-label="거절 버튼 문구"
                value={cardData.rejectButtonText}
                onChange={(event) => updateField("rejectButtonText", event.target.value)}
                placeholder="싫어요(직접 입력해보세요)"
              />
            </div>
          </div>
          {error ? <p className="error-text">{error}</p> : null}

          <div className="edit-controls">
            <ImageUploader
              label="수락 후 이미지/QR 추가(선택)"
              value={cardData.mainImage}
              onChange={(value) => updateField("mainImage", value)}
            />
          </div>
        </section>
      ) : null}

      {step.id === "accept" ? (
        <section className="creator-step">
          <div className="screen-preview">
            <div className="section-label">
              <span>{step.label}</span>
              <span>상대 화면</span>
            </div>
            <div className="result-preview accept-preview">
              <ImageBlock image={cardData.acceptImage} alt="수락 후 이미지" />
              <textarea
                className="result-message-input"
                aria-label="수락 결과 문구"
                rows="2"
                value={cardData.acceptResultText}
                onChange={(event) => updateField("acceptResultText", event.target.value)}
                placeholder="좋아요(직접 입력해보세요)"
              />
              {cardData.acceptReplyEnabled ? (
                <ReplyInput value="" onSubmit={() => {}} preview />
              ) : null}
            </div>
          </div>

          <div className="edit-controls">
            <ImageUploader
              label="수락 후 이미지/QR 추가(선택)"
              value={cardData.acceptImage}
              onChange={(value) => updateField("acceptImage", value)}
            />
            <ToggleSwitch
              checked={cardData.acceptReplyEnabled}
              label="답장 입력 받기 ON/OFF"
              onChange={(value) => updateField("acceptReplyEnabled", value)}
            />
          </div>
        </section>
      ) : null}

      {step.id === "reject" ? (
        <section className="creator-step">
          <div className="screen-preview">
            <div className="section-label">
              <span>{step.label}</span>
              <span>상대 화면</span>
            </div>
            <div className="result-preview reject-preview">
              <ImageBlock image={cardData.rejectImage} alt="거절 후 이미지" />
              <textarea
                className="result-message-input"
                aria-label="거절 결과 문구"
                rows="2"
                value={cardData.rejectResultText}
                onChange={(event) => updateField("rejectResultText", event.target.value)}
                placeholder="싫어요(직접 입력해보세요)"
              />
              {cardData.rejectReplyEnabled ? (
                <ReplyInput value="" onSubmit={() => {}} preview />
              ) : null}
            </div>
          </div>

          <div className="edit-controls">
            <ImageUploader
              label="거절 후 이미지 추가(선택)"
              value={cardData.rejectImage}
              onChange={(value) => updateField("rejectImage", value)}
            />
            <ToggleSwitch
              checked={cardData.rejectReplyEnabled}
              label="답장 입력 받기 ON/OFF"
              onChange={(value) => updateField("rejectReplyEnabled", value)}
            />
          </div>
        </section>
      ) : null}

      <div className="bottom-actions">
        <button className="button ghost-button" type="button" onClick={goPrevious}>
          이전
        </button>
        {stepIndex < steps.length - 1 ? (
          <button className="button button-accept" type="button" onClick={goNext}>
            다음
          </button>
        ) : (
          <button className="button button-accept" type="button" onClick={showCard}>
            보여주기
          </button>
        )}
      </div>
    </CardFrame>
  );
}
