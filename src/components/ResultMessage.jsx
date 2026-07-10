export default function ResultMessage({ children }) {
  return <>
    <span className="card_span">선택 답변</span>
    <p className="result-message">{children}</p>
  </>
}
