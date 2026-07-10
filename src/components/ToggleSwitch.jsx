export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <div className="toggle-row">
      <span>{label}</span>
      <button
        aria-label={`${label}: ${checked ? "켜짐" : "꺼짐"}`}
        aria-pressed={checked}
        className={`toggle-switch ${checked ? "is-on" : ""}`}
        type="button"
        onClick={() => onChange(!checked)}
      >
        <span aria-hidden="true" />
      </button>
    </div>
  );
}
