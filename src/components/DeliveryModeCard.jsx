export default function DeliveryModeCard({
  title,
  description,
  actionLabel,
  badge,
  disabled = false,
  onSelect
}) {
  return (
    <article className={`delivery-mode-card${disabled ? " is-disabled" : ""}`}>
      <div className="delivery-mode-copy">
        <div className="delivery-mode-title-row">
          <h2>{title}</h2>
          {badge ? <span className="delivery-mode-badge">{badge}</span> : null}
        </div>
        <p>{description}</p>
      </div>
      <button
        className="button delivery-mode-button"
        type="button"
        disabled={disabled}
        onClick={onSelect}
      >
        {actionLabel}
      </button>
    </article>
  );
}
