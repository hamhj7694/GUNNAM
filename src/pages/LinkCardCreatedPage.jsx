import { useState } from "react";
import { Navigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import OnlinePageNav from "../components/OnlinePageNav.jsx";

export default function LinkCardCreatedPage({ result = null }) {
  const [copied, setCopied] = useState("");
  if (!result?.shareUrl || !result?.managementUrl) return <Navigate to="/create/link" replace />;
  const shareUrl = result.shareUrl;
  const managementUrl = result.managementUrl;
  async function copy(value, label) {
    try { await navigator.clipboard.writeText(value); setCopied(label); }
    catch { setCopied("복사할 수 없어요. 주소를 직접 선택해 주세요."); }
  }
  return <CardFrame className="online-page online-complete">
    <header className="page-header"><p className="eyebrow">완성!</p><h1>링크를 건네보세요</h1></header>
    <section className="online-link-box"><strong>상대에게 보낼 링크</strong><input readOnly value={shareUrl} aria-label="공유 링크" /><button className="button button-accept" onClick={() => copy(shareUrl, "공유 링크를 복사했어요.")} type="button">공유 링크 복사</button></section>
    <section className="online-link-box is-management"><strong>나만 보관할 관리 링크</strong><p>받은 답변을 확인하는 비밀 링크예요. 잃어버리면 복구하기 어려워요.</p><input readOnly value={managementUrl} aria-label="관리 링크" /><button className="button secondary-button" onClick={() => copy(managementUrl, "관리 링크를 복사했어요.")} type="button">관리 링크 복사</button></section>
    {copied ? <p className="online-status" role="status">{copied}</p> : null}
    <OnlinePageNav managementUrl={managementUrl} />
  </CardFrame>;
}
