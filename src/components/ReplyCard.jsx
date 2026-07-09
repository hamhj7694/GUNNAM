export default function ReplyCard({ text }) {
  if (!text) {
    return null;
  }

  return (
    <article className="reply-card">
      <span>답장 카드</span>
      <p>{text}</p>
    </article>
  );
}
