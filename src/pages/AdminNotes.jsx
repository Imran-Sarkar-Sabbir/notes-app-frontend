import { Link, useSearchParams } from 'react-router';
import Pager from '../Pager.jsx';
import { usePaged } from '../usePaged.js';

export default function AdminNotes() {
  const [params] = useSearchParams();
  const owner = params.get('owner');
  const paged = usePaged(owner ? `/notes/all?owner=${owner}` : '/notes/all');
  const { items, error, loading } = paged;

  return (
    <>
      <h2>{owner ? "One user's notes" : "Everyone's notes"}</h2>
      {owner && <p><Link to="/admin/notes">Show everyone</Link></p>}
      {error && <p className="error">{error}</p>}
      {!loading && items.length === 0 && <p className="muted">No notes.</p>}

      {items.map((n) => (
        <div className="card" key={n._id}>
          <strong>{n.title}</strong>
          {n.content && <pre>{n.content}</pre>}
          <div className="muted">
            {n.owner?.name ? `${n.owner.name} (${n.owner.email})` : null} · {new Date(n.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
      <Pager {...paged} />
    </>
  );
}
