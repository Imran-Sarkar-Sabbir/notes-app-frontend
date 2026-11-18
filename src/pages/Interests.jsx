import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function Interests() {
  const [filter, setFilter] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const limit = 10;

  useEffect(() => {
    const qs = new URLSearchParams({ page, limit, ...(applied ? { interests: applied } : {}) });
    api(`/users/grouped-by-interest?${qs}`)
      .then((d) => { setData(d); setError(''); })
      .catch((e) => setError(e.message));
  }, [applied, page]);

  const pages = data ? Math.max(Math.ceil(data.totalGroups / limit), 1) : 1;

  return (
    <>
      <h2>Users by interest</h2>
      <form className="row" onSubmit={(e) => { e.preventDefault(); setPage(1); setApplied(filter.trim()); }}>
        <input style={{ flex: 1 }} placeholder="Only these interests, e.g. chess, reading (blank = all)" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <button>Apply</button>
      </form>
      {error && <p className="error">{error}</p>}
      {data?.groups.length === 0 && <p className="muted">No matching users.</p>}

      {data?.groups.map((g) => (
        <div className="card" key={g._id}>
          <strong>{g._id}</strong> <span className="muted">({g.count})</span>
          <div>{g.users.map((u) => u.name).join(', ')}</div>
        </div>
      ))}

      {data && pages > 1 && (
        <div className="row">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
