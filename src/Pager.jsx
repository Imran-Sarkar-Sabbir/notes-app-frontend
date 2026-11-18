export default function Pager({ pageNo, hasPrev, hasNext, prev, next, loading }) {
  if (!hasPrev && !hasNext) return null;
  return (
    <div className="pager" role="navigation" aria-label="Pagination">
      <button onClick={prev} disabled={!hasPrev || loading}>← Previous</button>
      <span className="muted">Page {pageNo}</span>
      <button onClick={next} disabled={!hasNext || loading}>Next →</button>
    </div>
  );
}
