import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";
import logoSymbol from "../assets/logo-symbol.svg";

export default function HomePage({ resetCardData }) {
  const navigate = useNavigate();

  function startCard() {
    resetCardData();
    navigate("/create");
  }

  return (
    <CardFrame className="home-page">
      <div className="home-content">
        <p className="eyebrow">조용히 건네고 싶을 때</p>
        <div className="home-brand">
          <img className="home-logo" src={logoSymbol} alt="" />
          <h1>건넴</h1>
        </div>
        <div className="home_box">
          <p>말하기 어려운 질문을 카드로 건네보세요.</p>
        </div>
      </div>
      <div className="home-actions">
        <button className="button button-accept" type="button" onClick={startCard}>
          카드 만들기
        </button>
        <p className="home-note">로그인 없이 바로 사용할 수 있어요.</p>
      </div>
    </CardFrame>
  );
}
