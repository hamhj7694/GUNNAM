import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";

const FILTERS = [
  { value: "all", label: "전체" },
  { value: "accept", label: "수락" },
  { value: "reject", label: "거절" }
];

function formatDate(value, fallback) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export default function HistoryPage({
  replyHistory,
  linkCardHistory,
  deleteReplyHistory,
  deleteLinkCardHistory
}) {
  const navigate = useNavigate();
  const [view, setView] = useState("replies");
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("");
  const filteredHistory = useMemo(
    () => filter === "all"
      ? replyHistory
      : replyHistory.filter((item) => item.responseType === filter),
    [filter, replyHistory]
  );

  function deleteReply(item) {
    if (window.confirm("이 답변 기록을 삭제할까요?")) deleteReplyHistory(item.id);
  }

  function deleteLinkCard(item) {
    if (window.confirm("이 링크 카드 기록을 이 브라우저에서 삭제할까요? 서버의 카드와 답변은 삭제되지 않아요.")) {
      deleteLinkCardHistory(item.id);
    }
  }

  async function copyLink(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      setStatus(`${label}을 복사했어요.`);
    } catch {
      setStatus("링크를 복사하지 못했어요.");
    }
  }

  return (
    <CardFrame className="history-page">
      <header className="history-header">
        <button aria-label="홈으로 돌아가기" className="screen-back-button" type="button" onClick={() => navigate("/")}>
          <span aria-hidden="true">←</span>
        </button>
        <div>
          <p className="eyebrow">내 브라우저에 저장된 기록</p>
          <h1>카드 히스토리</h1>
          <p className="history-count">
            받은 답변 {replyHistory.length}개 · 링크 카드 {linkCardHistory.length}개
          </p>
        </div>
      </header>

      <div className="history-view-tabs" aria-label="히스토리 종류">
        <button aria-pressed={view === "replies"} className={view === "replies" ? "is-active" : ""} type="button" onClick={() => setView("replies")}>
          받은 답변
        </button>
        <button aria-pressed={view === "links"} className={view === "links" ? "is-active" : ""} type="button" onClick={() => setView("links")}>
          내가 만든 링크
        </button>
      </div>

      {view === "replies" ? (
        <>
          <div className="history-filters" aria-label="답변 유형 필터">
            {FILTERS.map((item) => (
              <button aria-pressed={filter === item.value} className={filter === item.value ? "is-active" : ""} key={item.value} type="button" onClick={() => setFilter(item.value)}>
                {item.label}
              </button>
            ))}
          </div>
          {filteredHistory.length ? (
            <div className="history-list">
              {filteredHistory.map((item) => (
                <article className={`history-card history-card-${item.responseType}`} key={item.id}>
                  <div className="history-card-meta">
                    <span>{item.responseType === "accept" ? "수락" : "거절"}</span>
                    <time dateTime={item.receivedAt}>{formatDate(item.receivedAt, "받은 시간 없음")}</time>
                    <button aria-label="이 답변 기록 삭제" className="history-delete-button" type="button" onClick={() => deleteReply(item)}>삭제</button>
                  </div>
                  <p className="history-reply">{item.replyText}</p>
                  <details className="history-context">
                    <summary>어떤 카드에 대한 답변인지 보기</summary>
                    <dl>
                      <div><dt>질문</dt><dd>{item.context?.questionText || "질문 내용 없음"}</dd></div>
                      <div><dt>결과 문구</dt><dd>{item.context?.resultText || "결과 문구 없음"}</dd></div>
                    </dl>
                  </details>
                </article>
              ))}
            </div>
          ) : (
            <div className="history-empty"><strong>아직 받은 답변이 없어요.</strong><p>카드를 건네고 첫 번째 답변을 받아보세요.</p></div>
          )}
        </>
      ) : (
        <>
          <div className="link-history-security" role="note">
            <strong>이 기기에서만 확인할 수 있어요</strong>
            <p>관리 링크는 작성자 권한을 포함해 이 브라우저에 저장돼요. 공용 기기라면 사용 후 기록을 삭제해 주세요.</p>
          </div>
          {linkCardHistory.length ? (
            <div className="history-list">
              {linkCardHistory.map((item) => (
                <article className="history-card link-history-card" key={item.id}>
                  <div className="history-card-meta">
                    <span>링크 카드</span>
                    <time dateTime={item.createdAt}>{formatDate(item.createdAt, "만든 시간 없음")}</time>
                    <button aria-label="이 링크 카드 기록 삭제" className="history-delete-button" type="button" onClick={() => deleteLinkCard(item)}>삭제</button>
                  </div>
                  <p className="link-history-question">{item.questionText || "카드 문구 없음"}</p>
                  <div className="link-history-actions">
                    <button className="button secondary-button" type="button" onClick={() => copyLink(item.shareUrl, "공유 링크")}>공유 링크 복사</button>
                    <button className="button home-continue-button" type="button" onClick={() => window.location.assign(item.managementUrl)}>받은 답변 확인</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="history-empty"><strong>저장된 링크 카드가 없어요.</strong><p>링크 카드를 만들면 이 브라우저에 자동으로 기록돼요.</p></div>
          )}
        </>
      )}
      {status ? <p className="online-status" role="status">{status}</p> : null}
    </CardFrame>
  );
}
