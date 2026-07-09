export default function MainQuestionCard({ image, text }) {
  return (
    <article className="question-card">
      {image ? <img src={image} alt="메인 카드 이미지" /> : null}
      <p>{text}</p>
    </article>
  );
}
