import { useId, useRef } from "react";

export default function ImageUploader({ label, value, onChange }) {
  const inputId = useId();
  const inputRef = useRef(null);

  function selectImage(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result);
    reader.readAsDataURL(file);
  }

  function removeImage() {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="uploader">
      <label className="uploader-label" htmlFor={inputId}>
        {label}
      </label>
      {value ? <p className="uploader-status">이미지가 선택되었어요.</p> : null}
      <input
        ref={inputRef}
        accept="image/*"
        className="visually-hidden"
        id={inputId}
        type="file"
        onChange={selectImage}
      />
      <div className="uploader-actions">
        <button
          className="secondary-button"
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          {value ? "다시 선택" : "이미지 선택"}
        </button>
        {value ? (
          <button
            className="secondary-button danger"
            type="button"
            onClick={removeImage}
          >
            삭제
          </button>
        ) : null}
      </div>
    </div>
  );
}
