import { useEffect, useState } from "react";
import CardFrame from "../components/CardFrame.jsx";
import OnlinePageNav from "../components/OnlinePageNav.jsx";
import {
  getManagedCard,
  listManagedResponses,
  updateManagedResponseVisibility
} from "../api/onlineCardsApi.js";
import {
  ensureManagementSession,
  hasManagementToken
} from "../utils/managementSession.js";

export default function OnlineInboxPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibilitySaving, setVisibilitySaving] = useState(false);
  const [visibilityStatus, setVisibilityStatus] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [cardData, responseData] = await Promise.all([
        getManagedCard(),
        listManagedResponses()
      ]);
      setData({
        card: cardData.card,
        responses: responseData.items || [],
        nextCursor: responseData.nextCursor || null
      });
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!data?.nextCursor || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const responseData = await listManagedResponses(data.nextCursor);
      setData((current) => ({
        ...current,
        responses: [...current.responses, ...(responseData.items || [])],
        nextCursor: responseData.nextCursor || null
      }));
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoadingMore(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        await ensureManagementSession();
        if (!cancelled) await load();
      } catch (nextError) {
        if (!cancelled) {
          setError(
            nextError.status === 401 && !hasManagementToken()
              ? "관리 링크로 다시 접속해 주세요."
              : nextError.message
          );
          setLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  async function retry() {
    setLoading(true);
    setError("");
    try {
      await ensureManagementSession();
      await load();
    } catch (nextError) {
      setError(
        nextError.status === 401 && !hasManagementToken()
          ? "관리 링크로 다시 접속해 주세요."
          : nextError.message
      );
      setLoading(false);
    }
  }

  async function changeVisibility(event) {
    const nextVisibility = event.target.value;
    const previousVisibility = data.card.responseVisibility || "owner_only";
    setData((current) => ({ ...current, card: { ...current.card, responseVisibility: nextVisibility } }));
    setVisibilitySaving(true);
    setVisibilityStatus("");
    setError("");
    try {
      const result = await updateManagedResponseVisibility(nextVisibility);
      setData((current) => ({
        ...current,
        card: { ...current.card, ...(result.card || {}), responseVisibility: result.card?.responseVisibility || result.responseVisibility || nextVisibility }
      }));
      setVisibilityStatus("공개 범위를 변경했어요.");
    } catch (nextError) {
      setData((current) => ({ ...current, card: { ...current.card, responseVisibility: previousVisibility } }));
      setError(nextError.message);
    } finally {
      setVisibilitySaving(false);
    }
  }

  if (loading) {
    return (
      <CardFrame className="online-state">
        <p role="status">받은 답변을 불러오는 중…</p>
        <OnlinePageNav />
      </CardFrame>
    );
  }

  if (!data) {
    return (
      <CardFrame className="online-state">
        <p className="error-text" role="alert">
          {error || (hasManagementToken()
            ? "관리 링크를 확인하지 못했어요."
            : "관리 링크로 다시 접속해 주세요.")}
        </p>
        <button className="button secondary-button" onClick={retry} type="button">
          다시 시도
        </button>
        <OnlinePageNav />
      </CardFrame>
    );
  }

  const responses = data.responses || [];

  return (
    <CardFrame className="online-page">
      <header className="page-header">
        <p className="eyebrow">관리 링크</p>
        <h1>받은 답변</h1>
        <p className="online-help">
          지금까지 {responses.length}개의 답변을 불러왔어요.
        </p>
      </header>

      <section className="visibility-setting" aria-labelledby="visibility-setting-title">
        <h2 id="visibility-setting-title">받은 답변 공개 범위</h2>
        <label>
          <span className="visually-hidden">공개 범위 선택</span>
          <select
            disabled={visibilitySaving}
            onChange={changeVisibility}
            value={data.card.responseVisibility || "owner_only"}
          >
            <option value="owner_only">작성자만 보기</option>
            <option value="counts_only">결과 숫자만 공개</option>
            <option value="all_responses">전체 답변 공개</option>
          </select>
        </label>
        <p className="online-help">
          작성자만 보기에서는 모든 내용을 나만 확인해요. 결과 숫자만 공개하면 수락·거절 집계만 보이고,
          전체 답변 공개에서는 공개에 동의한 답변만 선택·닉네임·추가 의견이 보여요.
        </p>
        {data.card.responseVisibility === "all_responses" ? (
          <p className="online-help">동의한 답변만 공개되며 기존 비동의 답변은 공개되지 않아요.</p>
        ) : null}
        {visibilitySaving ? <p className="online-status" role="status">변경하는 중…</p> : null}
        {visibilityStatus ? <p className="online-status" role="status">{visibilityStatus}</p> : null}
      </section>

      {responses.length ? (
        <div className="online-response-list">
          {responses.map((item) => (
            <article
              className={`online-response-card ${item.responseType}`}
              key={item.id}
            >
              <strong>{item.responseType === "accept" ? "수락" : "거절"}</strong>
              <span>{item.nickname || "익명"}</span>
              {item.replyText ? (
                <p>{item.replyText}</p>
              ) : (
                <p className="online-help">추가 의견 없음</p>
              )}
              <time>
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString("ko-KR")
                  : ""}
              </time>
            </article>
          ))}
          {data.nextCursor ? (
            <button
              className="button secondary-button"
              disabled={loadingMore}
              onClick={loadMore}
              type="button"
            >
              {loadingMore ? "더 불러오는 중…" : "답변 더 보기"}
            </button>
          ) : null}
        </div>
      ) : (
        <div className="history-empty">
          <strong>아직 받은 답변이 없어요</strong>
          <p>공유 링크를 건네면 여기에 답변이 모여요.</p>
        </div>
      )}

      {error ? <p className="error-text" role="alert">{error}</p> : null}
      <OnlinePageNav />
    </CardFrame>
  );
}
