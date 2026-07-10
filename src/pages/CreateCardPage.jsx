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

export default function CreateCardPage({ cardData, setCardData }) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState("");
  const step = steps[stepIndex];

  function updateField(field, value) {
    setCardData({ [field]: value });
    if (field === "mainText" && value.trim()) {
      setError("");
    }
  }

  function selectStep(index) {
    setError("");
    setStepIndex(index);
  }

  function goPrevious() {
    if (stepIndex === 0) {
      navigate("/");
      return;
    }

    setStepIndex((current) => current - 1);
  }

  function goNext() {
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  function showCard() {
    if (!cardData.mainText.trim()) {
      setError("상대에게 보여줄 내용을 적어주세요.");
      setStepIndex(0);
      return;
    }

    setError("");
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
        <h1>건넬 화면을 만들어보세요</h1>
      </header>

      <nav className="step-tabs" aria-label="카드 작성 단계">
        {steps.map((item, index) => (
          <button
            aria-current={index === stepIndex ? "step" : undefined}
            className={index === stepIndex ? "is-active" : ""}
            key={item.id}
            type="button"
            onClick={() => selectStep(index)}
          >
            <span>{index + 1}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}

      {step.id === "main" ? (
        <section className="creator-step" aria-labelledby="main-step-title">
          <div className="screen-preview">
            <div className="section-label">
              <span id="main-step-title">메인 카드</span>
              <span>상대 화면</span>
            </div>
            <article className="question-card editable-question-card">
              {cardData.mainImage ? (
                <img src={cardData.mainImage} alt="선택한 메인 카드" />
              ) : null}
              <textarea
                aria-label="메인 카드 문구"
                placeholder={"(필수 입력)\n상대에게 보여줄 문구를\n직접 입력해 보세요"}
                rows="4"
                value={cardData.mainText}
                onChange={(event) => updateField("mainText", event.target.value)}
              />
            </article>
            <div className="editable-action-buttons">
              <input
                aria-label="수락 버튼 문구"
                className="button-input accept-input"
                placeholder="좋아요 (직접 입력해 보세요)"
                value={cardData.acceptButtonText}
                onChange={(event) =>
                  updateField("acceptButtonText", event.target.value)
                }
              />
              <input
                aria-label="거절 버튼 문구"
                className="button-input reject-input"
                placeholder="싫어요 (직접 입력해 보세요)"
                value={cardData.rejectButtonText}
                onChange={(event) =>
                  updateField("rejectButtonText", event.target.value)
                }
              />
            </div>
          </div>

          <div className="edit-controls">
            <ImageUploader
              label="[선택] 보여주고 싶은 이미지/QR 추가"
              value={cardData.mainImage}
              onChange={(value) => updateField("mainImage", value)}
            />
          </div>
        </section>
      ) : null}

      {step.id === "accept" ? (
        <section className="creator-step" aria-labelledby="accept-step-title">
          <div className="screen-preview">
            <div className="section-label">
              <span id="accept-step-title">수락 페이지</span>
              <span>상대 화면</span>
            </div>
            <div className="result-preview accept-preview">
              <ImageBlock image={cardData.acceptImage} alt="선택한 수락 결과" />
              <textarea
                aria-label="수락 결과 문구"
                className="result-message-input"
                placeholder={"수락에 대한 문구를\n직접 입력해 보세요\n(미입력 시 '선택된 답변')"}
                rows="3"
                value={cardData.acceptResultText}
                onChange={(event) =>
                  updateField("acceptResultText", event.target.value)
                }
              />
              {cardData.acceptReplyEnabled ? (
                // <ReplyInput preview value="" onSubmit={() => {}} />
                <h4>"답장 카드를 받을 수 있어요"</h4>
              ) : null}
            </div>
          </div>

          <div className="edit-controls">
            <ImageUploader
              label="[선택] 보여주고 싶은 이미지/QR 추가"
              value={cardData.acceptImage}
              onChange={(value) => updateField("acceptImage", value)}
            />
            <ToggleSwitch
              checked={cardData.acceptReplyEnabled}
              label="수락 후 답장 받기"
              onChange={(value) => updateField("acceptReplyEnabled", value)}
            />
          </div>
        </section>
      ) : null}

      {step.id === "reject" ? (
        <section className="creator-step" aria-labelledby="reject-step-title">
          <div className="screen-preview">
            <div className="section-label">
              <span id="reject-step-title">거절 페이지</span>
              <span>상대 화면</span>
            </div>
            <div className="result-preview reject-preview">
              <ImageBlock image={cardData.rejectImage} alt="선택한 거절 결과" />
              <textarea
                aria-label="거절 결과 문구"
                className="result-message-input"
                placeholder={"거절에 대한 문구를\n직접 입력해 보세요\n(미입력 시 '선택된 답변')"}
                rows="3"
                value={cardData.rejectResultText}
                onChange={(event) =>
                  updateField("rejectResultText", event.target.value)
                }
              />
              {cardData.rejectReplyEnabled ? (
                // <ReplyInput preview value="" onSubmit={() => {}} />
                <h4>"답장 카드를 받을 수 있어요"</h4>
              ) : null}
            </div>
          </div>

          <div className="edit-controls">
            <ImageUploader
              label="[선택] 보여주고 싶은 이미지 추가"
              value={cardData.rejectImage}
              onChange={(value) => updateField("rejectImage", value)}
            />
            <ToggleSwitch
              checked={cardData.rejectReplyEnabled}
              label="거절 후 답장 받기"
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
            건네 보여주기
          </button>
        )}
      </div>
    </CardFrame>
  );
}
