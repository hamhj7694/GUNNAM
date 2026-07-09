export default function ToggleSwitch({ checked, onChange, label }) {
  return (
    <label className="toggle-row">
      <span>{label}</span>
      <button
        className={`toggle-switch ${checked ? "is-on" : ""}`}
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </label>
  );
}
