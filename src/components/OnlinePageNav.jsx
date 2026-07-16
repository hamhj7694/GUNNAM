import { Link } from "react-router-dom";

export default function OnlinePageNav({ managementUrl = "", className = "" }) {
  return (
    <nav className={`online-page-nav ${className}`.trim()} aria-label="온라인 카드 이동">
      <Link className="button ghost-button" to="/">
        건넴 홈
      </Link>
      {managementUrl ? (
        <button
          className="button secondary-button"
          type="button"
          onClick={() => window.location.replace(managementUrl)}
        >
          받은 답변 확인
        </button>
      ) : null}
    </nav>
  );
}
