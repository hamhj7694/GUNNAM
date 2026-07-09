import { useState } from "react";

export default function ReplyInput({ value, onSubmit, preview = false }) {
  const [text, setText] = useState(value);
  const [error, setError] = useState("");

  function submitReply(event) {
    event.preventDefault();
    if (preview) {
      return;
    }

    if (!text.trim()) {
      setError("메시지를 입력해주세요.");
      return;
    }

    setError("");
    onSubmit(text.trim());
  }

  return (
    <form className={`reply-input ${preview ? "is-preview" : ""}`} onSubmit={submitReply}>
      {preview ? null : (
        <label htmlFor="replyText">하고 싶은 말을 남겨주세요</label>
      )}
      <textarea
        id="replyText"
        rows="3"
        value={text}
        readOnly={preview}
        onChange={(event) => setText(event.target.value)}
        placeholder={preview ? "여기에 답변을 받을 수 있어요!" : "짧게 적어주세요."}
      />
      {error ? <p className="error-text">{error}</p> : null}
      {preview ? null : (
        <button className="button button-accept" type="submit">
          남기기
        </button>
      )}
    </form>
  );
}
