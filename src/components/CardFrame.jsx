export default function CardFrame({ children, className = "" }) {
  return (
    <main className="app-shell">
      <section className={`phone-frame ${className}`}>{children}</section>
    </main>
  );
}
