import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import OnlinePageNav from "../components/OnlinePageNav.jsx";
import { createLinkCard } from "../api/onlineCardsApi.js";
import LinkCardCreatedPage from "./LinkCardCreatedPage.jsx";

const initialForm = {
  mainText: "",
  acceptButtonText: "",
  rejectButtonText: "",
  acceptResultText: "",
  rejectResultText: "",
  responseVisibility: "owner_only"
};

const visibilityOptions = [
  {
    value: "owner_only",
    label: "작성자만 보기",
    description: "수락·거절 선택과 답변 내용은 작성자만 확인해요."
  },
  {
    value: "counts_only",
    label: "결과 숫자만 공개",
    description: "수락·거절 숫자만 다른 사람에게 보여요. 닉네임과 추가 의견은 공개하지 않아요."
  },
  {
    value: "all_responses",
    label: "전체 답변 공개",
    description: "숫자와 공개에 동의한 사람의 닉네임·추가 의견을 함께 보여줘요."
  }
];

export default function LinkCardCreatePage({ recordCreatedLinkCard }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState(null);
  const idempotencyKey = useRef(crypto.randomUUID());

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.mainText.trim()) {
      setError("상대에게 보여줄 내용을 적어주세요.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await createLinkCard({
        deliveryMode: "link",
        questionText: form.mainText.trim(),
        responseVisibility: form.responseVisibility,
        acceptButtonText: form.acceptButtonText.trim() || "좋아요",
        rejectButtonText: form.rejectButtonText.trim() || "싫어요",
        acceptResultText: form.acceptResultText.trim() || null,
        rejectResultText: form.rejectResultText.trim() || null
      }, idempotencyKey.current);
      recordCreatedLinkCard(result);
      setCreatedResult(result);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (createdResult) {
    return <LinkCardCreatedPage result={createdResult} />;
  }

  return (
    <CardFrame className="online-page">
      <button className="screen-back-button" type="button" onClick={() => navigate("/create/mode")} aria-label="건네는 방식으로 돌아가기">←</button>
      <header className="page-header"><p className="eyebrow">링크로 건넴</p><h1>공유할 카드를 만들어요</h1><p className="online-help">카드와 답변은 온라인에 저장돼요.</p></header>
      <form className="online-form" onSubmit={submit}>
        <label>카드 문구 <textarea required rows="4" value={form.mainText} onChange={(e) => update("mainText", e.target.value)} /></label>
        <div className="online-two-columns">
          <label>수락 버튼<input placeholder="좋아요" value={form.acceptButtonText} onChange={(e) => update("acceptButtonText", e.target.value)} /></label>
          <label>거절 버튼<input placeholder="싫어요" value={form.rejectButtonText} onChange={(e) => update("rejectButtonText", e.target.value)} /></label>
        </div>
        <label>수락 후 문구 <textarea rows="2" value={form.acceptResultText} onChange={(e) => update("acceptResultText", e.target.value)} /></label>
        <label>거절 후 문구 <textarea rows="2" value={form.rejectResultText} onChange={(e) => update("rejectResultText", e.target.value)} /></label>
        <fieldset className="visibility-options">
          <legend>받은 답변 공개 범위</legend>
          {visibilityOptions.map((option) => (
            <label className="online-radio visibility-option" key={option.value}>
              <input
                checked={form.responseVisibility === option.value}
                name="responseVisibility"
                onChange={() => update("responseVisibility", option.value)}
                type="radio"
                value={option.value}
              />
              <span><strong>{option.label}</strong><small>{option.description}</small></span>
            </label>
          ))}
        </fieldset>
        {error ? <p className="error-text" role="alert">{error}</p> : null}
        <button className="button button-accept" disabled={submitting} type="submit">{submitting ? "만드는 중…" : "공유 링크 만들기"}</button>
      </form>
      <OnlinePageNav />
    </CardFrame>
  );
}
