export default function ActionButtons({
  acceptText,
  rejectText,
  onAccept,
  onReject
}) {
  return (
    <div className="action-buttons">
      <button className="button button-accept" type="button" onClick={onAccept}>
        {acceptText}
      </button>
      <button className="button button-reject" type="button" onClick={onReject}>
        {rejectText}
      </button>
    </div>
  );
}
