import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import ActionButtons from "../components/ActionButtons.jsx";
import MainQuestionCard from "../components/MainQuestionCard.jsx";
import OnlinePageNav from "../components/OnlinePageNav.jsx";
import {
  getSharedCard,
  listPublicResponses,
  submitResponse
} from "../api/onlineCardsApi.js";

const visibilityNotices = {
  owner_only: "작성자만 답변을 확인할 수 있어요. 선택, 닉네임과 추가 의견은 다른 사람에게 공개되지 않아요.",
  counts_only: "수락·거절 결과 숫자는 공유 링크를 아는 사람에게 공개돼요. 닉네임과 추가 의견은 작성자만 확인할 수 있어요.",
  all_responses: "공개에 동의하면 선택, 닉네임과 추가 의견이 공유 링크를 아는 사람에게 공개돼요. 동의하지 않아도 답변할 수 있어요."
};

function PublicResults({ data, loading, onLoad, onLoadMore }) {
  if (!data) {
    return <button className="button secondary-button" disabled={loading} onClick={onLoad} type="button">{loading ? "불러오는 중…" : "공개 결과 보기"}</button>;
  }
  const counts = data.counts || {};
  const items = data.items || data.responses || [];
  return (
    <section className="public-results" aria-labelledby="public-results-title">
      <h2 id="public-results-title">공개 결과</h2>
      {data.kind === "counts" ? <div className="public-counts">
        <div><span>전체</span><strong>{counts.total ?? ((counts.accept || 0) + (counts.reject || 0))}</strong></div>
        <div><span>수락</span><strong>{counts.accept || 0}</strong></div>
        <div><span>거절</span><strong>{counts.reject || 0}</strong></div>
      </div> : null}
      {items.map((item, index) => (
        <article className={`online-response-card ${item.responseType}`} key={`${item.responseType}-${index}`}>
          <strong>{item.responseType === "accept" ? "수락" : "거절"}</strong>
          <span>{item.nickname || "익명"}</span>
          {item.replyText ? <p>{item.replyText}</p> : null}
        </article>
      ))}
      {data.kind === "responses" && !items.length ? <p className="online-help">아직 공개에 동의한 답변이 없어요.</p> : null}
      {data.nextCursor ? <button className="button secondary-button" disabled={loading} onClick={onLoadMore} type="button">{loading ? "불러오는 중…" : "공개 답변 더 보기"}</button> : null}
    </section>
  );
}

export default function SharedCardPage() {
  const { shareToken } = useParams();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [choice, setChoice] = useState("");
  const [nickname, setNickname] = useState("");
  const [replyText, setReplyText] = useState("");
  const [publicConsent, setPublicConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [publicData, setPublicData] = useState(null);
  const [publicLoading, setPublicLoading] = useState(false);
  const idempotencyKey = useRef(crypto.randomUUID());

  async function load() {
    setLoading(true);
    setError("");
    try { setCard(await getSharedCard(shareToken)); } catch (nextError) { setError(nextError.message); } finally { setLoading(false); }
  }

  async function loadPublic(cursor) {
    setPublicLoading(true);
    setError("");
    try {
      const next = await listPublicResponses(shareToken, cursor);
      setPublicData((current) => cursor ? {
        ...next,
        items: [...(current?.items || current?.responses || []), ...(next.items || next.responses || [])]
      } : next);
    } catch (nextError) { setError(nextError.message); } finally { setPublicLoading(false); }
  }

  useEffect(() => { load(); }, [shareToken]);

  async function submit(event) {
    event.preventDefault();
    if (!choice) return;
    setSubmitting(true);
    setError("");
    try {
      const result = await submitResponse(shareToken, {
        responseType: choice,
        nickname: nickname.trim() || null,
        replyText: replyText.trim() || null,
        visibilityAtSubmission: visibility,
        publicConsent: visibility === "all_responses" ? publicConsent : false
      }, idempotencyKey.current);
      setDone(result);
    } catch (nextError) {
      if (nextError.code === "VISIBILITY_CHANGED") {
        await load();
        setPublicData(null);
        setPublicConsent(false);
        setError("답변 공개 범위가 변경됐어요. 내용을 확인한 뒤 다시 제출해 주세요.");
      } else {
        setError(nextError.message);
      }
    } finally { setSubmitting(false); }
  }

  if (loading) return <CardFrame className="online-state"><p role="status">카드를 불러오는 중…</p><OnlinePageNav /></CardFrame>;
  if (!card) return <CardFrame className="online-state"><p className="error-text" role="alert">{error || "카드를 찾을 수 없어요."}</p><button className="button secondary-button" onClick={load} type="button">다시 시도</button><OnlinePageNav /></CardFrame>;
  const publicCard = card.card || card;
  const payload = { ...publicCard, mainText: publicCard.mainText || publicCard.questionText };
  const visibility = publicCard.responseVisibility || "owner_only";
  const canViewPublic = visibility !== "owner_only";
  if (done) return <CardFrame className="online-state"><h1>답변을 건넸어요!</h1><p>{done.result?.text || (choice === "accept" ? payload.acceptResultText || payload.acceptButtonText : payload.rejectResultText || payload.rejectButtonText)}</p>{canViewPublic ? <PublicResults data={publicData} loading={publicLoading} onLoad={() => loadPublic()} onLoadMore={() => loadPublic(publicData?.nextCursor)} /> : null}<OnlinePageNav /></CardFrame>;
  return (
    <CardFrame className="online-page shared-card-page">
      <header className="page-header"><p className="eyebrow">도착한 카드</p><h1>마음을 선택해 주세요</h1></header>
      <MainQuestionCard text={payload.mainText} image={payload.mainImage} />
      <ActionButtons acceptText={payload.acceptButtonText || "좋아요"} rejectText={payload.rejectButtonText || "싫어요"} onAccept={() => setChoice("accept")} onReject={() => setChoice("reject")} />
      {choice ? (
        <form className="online-form online-response-form" onSubmit={submit}>
          <p className={`choice-notice ${choice}`}>{choice === "accept" ? "수락을 선택했어요" : "거절을 선택했어요"}</p>
          <label>닉네임 (선택)<input value={nickname} maxLength="50" onChange={(event) => setNickname(event.target.value)} /></label>
          <label>추가 의견 (선택)<textarea rows="4" maxLength="1000" value={replyText} onChange={(event) => setReplyText(event.target.value)} /></label>
          <p className="online-help">{card.responseNotice || visibilityNotices[visibility]}</p>
          {visibility === "all_responses" ? (
            <label className="online-consent">
              <input checked={publicConsent} onChange={(event) => setPublicConsent(event.target.checked)} type="checkbox" />
              <span>내 선택, 닉네임과 추가 의견을 이 카드의 공개 답변에 표시하는 것에 동의해요.</span>
            </label>
          ) : null}
          {error ? <p className="error-text" role="alert">{error}</p> : null}
          <button className="button button-accept" disabled={submitting} type="submit">{submitting ? "건네는 중…" : "답변 건네기"}</button>
        </form>
      ) : null}
      {canViewPublic ? <PublicResults data={publicData} loading={publicLoading} onLoad={() => loadPublic()} onLoadMore={() => loadPublic(publicData?.nextCursor)} /> : null}
      <OnlinePageNav />
    </CardFrame>
  );
}
