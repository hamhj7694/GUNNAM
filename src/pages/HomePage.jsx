import { useNavigate } from "react-router-dom";
import CardFrame from "../components/CardFrame.jsx";

export default function HomePage({ resetCardData }) {
  const navigate = useNavigate();

  function startBlank() {
    resetCardData();
    navigate("/create");
  }

  return (
    <CardFrame className="home-page">
      <div className="home-content">
        <p className="eyebrow">로그인 없이 바로 사용</p>
        <h1>건넴</h1>
        <p className="home-copy">
          말로 꺼내기 애매한 부탁이나 질문을 작은 카드로 건네보세요.
        </p>
      </div>
      <div className="home-actions">
        <button className="button button-accept" type="button" onClick={startBlank}>
          카드 만들기
        </button>
      </div>
    </CardFrame>
  );
}
