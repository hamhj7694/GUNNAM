import { useId, useState } from "react";

export default function ReplyInput({
  value = "",
  onSubmit,
  preview = false,
  submitted = false
}) {
  const inputId = useId();
  const [text, setText] = useState(value);
  const [error, setError] = useState("");

  function submitReply(event) {
    event.preventDefault();
    if (preview) {
      return;
    }

    const normalizedText = text.trim();
    if (!normalizedText) {
      setError("메시지를 입력해주세요.");
      return;
    }

    setError("");
    onSubmit(normalizedText);
  }

  return (
    <form
      className={`reply-input ${preview ? "is-preview" : ""}`}
      onSubmit={submitReply}
    >
      {preview ? null : (
        <label htmlFor={inputId}>하고 싶은 말을 남겨주세요</label>
      )}
      <textarea
        aria-label={preview ? "답장 입력 미리보기" : undefined}
        id={inputId}
        placeholder={preview ? "여기에 답장을 받을 수 있어요" : "여기에 답장을 남길 수 있어요"}
        readOnly={preview}
        rows="3"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {error ? (
        <p className="error-text" role="alert">
          {error}
        </p>
      ) : null}
      {preview ? null : (
        <button className="button button-accept" type="submit">
          {submitted ? "수정해서 다시 남기기" : "남기기"}
        </button>
      )}
    </form>
  );
}
