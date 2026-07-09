import { useRef } from "react";

export default function ImageUploader({ label, value, onChange }) {
  const inputRef = useRef(null);

  function selectFile(event) {
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
      <div className="uploader-head">
        <span>{label}</span>
      </div>
      {value ? <p className="uploader-status">이미지가 선택됐어요.</p> : null}
      <input
        ref={inputRef}
        accept="image/*"
        className="visually-hidden"
        type="file"
        onChange={selectFile}
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
          <button className="secondary-button danger" type="button" onClick={removeImage}>
            삭제
          </button>
        ) : null}
      </div>
    </div>
  );
}
