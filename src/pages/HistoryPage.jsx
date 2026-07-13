import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";

const FILTERS = [
  { value: "all", label: "전체" },
  { value: "accept", label: "수락" },
  { value: "reject", label: "거절" }
];

function formatReceivedAt(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "받은 시간 없음";
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export default function HistoryPage({ replyHistory, deleteReplyHistory }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const filteredHistory = useMemo(
    () =>
      filter === "all"
        ? replyHistory
        : replyHistory.filter((item) => item.responseType === filter),
    [filter, replyHistory]
  );

  function deleteHistoryItem(item) {
    if (window.confirm("이 답변 기록을 삭제할까요?")) {
      deleteReplyHistory(item.id);
    }
  }

  return (
    <CardFrame className="history-page">
      <header className="history-header">
        <button
          aria-label="홈으로 돌아가기"
          className="screen-back-button"
          type="button"
          onClick={() => navigate("/")}
        >
          <span aria-hidden="true">←</span>
        </button>
        <div>
          <p className="eyebrow">상대방이 남긴 마음</p>
          <h1>받은 답변</h1>
          <p className="history-count">총 {replyHistory.length}개의 답변</p>
        </div>
      </header>

      <div className="history-filters" aria-label="답변 유형 필터">
        {FILTERS.map((item) => (
          <button
            aria-pressed={filter === item.value}
            className={filter === item.value ? "is-active" : ""}
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {filteredHistory.length ? (
        <div className="history-list">
          {filteredHistory.map((item) => (
            <article
              className={`history-card history-card-${item.responseType}`}
              key={item.id}
            >
              <div className="history-card-meta">
                <span>{item.responseType === "accept" ? "수락" : "거절"}</span>
                <time dateTime={item.receivedAt}>
                  {formatReceivedAt(item.receivedAt)}
                </time>
                <button
                  aria-label="이 답변 기록 삭제"
                  className="history-delete-button"
                  type="button"
                  onClick={() => deleteHistoryItem(item)}
                >
                  삭제
                </button>
              </div>
              <p className="history-reply">{item.replyText}</p>
              <details className="history-context">
                <summary>어떤 카드에 대한 답변인지 보기</summary>
                <dl>
                  <div>
                    <dt>질문</dt>
                    <dd>{item.context?.questionText || "질문 내용 없음"}</dd>
                  </div>
                  <div>
                    <dt>결과 문구</dt>
                    <dd>{item.context?.resultText || "결과 문구 없음"}</dd>
                  </div>
                </dl>
              </details>
            </article>
          ))}
        </div>
      ) : (
        <div className="history-empty">
          <strong>아직 받은 답변이 없어요.</strong>
          <p>카드를 건네고 첫 번째 답변을 받아보세요.</p>
        </div>
      )}
    </CardFrame>
  );
}
