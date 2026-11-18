import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';
import Drawer from '../Drawer.jsx';
import Pager from '../Pager.jsx';
import { usePaged } from '../usePaged.js';

const DATES = [
  ['', 'Any time'],
  ['day', 'Past 24 hours'],
  ['week', 'Past week'],
  ['month', 'Past month'],
  ['year', 'Past year'],
];
const SORTS = [
  ['newest', 'Newest'],
  ['oldest', 'Oldest'],
];

function Highlight({ text, term }) {
  if (!term) return text;
  const parts = text.split(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part));
}

function Pills({ label, options, value, onChange }) {
  return (
    <div className="pill-group" role="group" aria-label={label}>
      <span className="pill-label">{label}</span>
      {options.map(([v, text]) => (
        <button key={v} type="button" className={`pill${value === v ? ' on' : ''}`} aria-pressed={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

function PostForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ title: '', body: '' });
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        Title
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      </label>
      <label>
        Post
        <textarea placeholder="What do you want to talk about?" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
      </label>
      {error && <div className="error">{error}</div>}
      <div className="drawer-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button className="primary">Publish</button>
      </div>
    </form>
  );
}

export default function Posts() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const since = params.get('since') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const [draft, setDraft] = useState(q);
  const [writing, setWriting] = useState(false);
  const [otherId, setOtherId] = useState('');
  const isMine = id === me._id;

  const query = new URLSearchParams({ ...(q && { q }), ...(since && { since }), ...(sort !== 'newest' && { sort }) }).toString();
  const paged = usePaged(`/users/${id}/posts${query ? `?${query}` : ''}`, 5);
  const { items, setItems, page, error, loading, reload } = paged;

  const setFilter = (key, value, fallback = '') => {
    const next = new URLSearchParams(params);
    if (value === fallback) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };
  const filtered = Boolean(q || since || sort !== 'newest');

  async function create(form) {
    await api('/posts', { method: 'POST', body: form });
    reload();
    setWriting(false);
  }

  async function remove(postId) {
    if (!confirm('Delete this post?')) return;
    await api(`/posts/${postId}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((p) => p._id !== postId));
  }

  return (
    <>
      <div className="page-head">
        <h2>{isMine ? 'My posts' : `Posts by ${page?.user.name ?? '…'}`}</h2>
        {isMine ? (
          <button className="primary" onClick={() => setWriting(true)}>Start a post</button>
        ) : (
          <button onClick={() => navigate(`/users/${me._id}/posts`)}>Back to mine</button>
        )}
      </div>

      <div className="search-panel">
        <form className="search-bar" role="search" onSubmit={(e) => { e.preventDefault(); setFilter('q', draft.trim()); }}>
          <svg className="search-icon" aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" placeholder="Search posts by title or text" value={draft} onChange={(e) => setDraft(e.target.value)} />
          <button className="primary">Search</button>
        </form>
        <Pills label="Date posted" options={DATES} value={since} onChange={(v) => setFilter('since', v)} />
        <Pills label="Sort by" options={SORTS} value={sort} onChange={(v) => setFilter('sort', v, 'newest')} />
        {filtered && (
          <button type="button" className="link" onClick={() => { setDraft(''); setParams({}, { replace: true }); }}>
            Clear all filters
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}
      {!loading && !error && items.length === 0 && (
        <p className="muted">{filtered ? 'No posts match these filters.' : 'No posts yet.'}</p>
      )}
      {items.map((p) => (
        <div className="card" key={p._id}>
          <div className="row">
            <strong style={{ flex: 1 }}><Highlight text={p.title} term={q} /></strong>
            {isMine && <button onClick={() => remove(p._id)}>Delete</button>}
          </div>
          <pre><Highlight text={p.body} term={q} /></pre>
          <div className="muted">{new Date(p.createdAt).toLocaleString()}</div>
        </div>
      ))}
      <Pager {...paged} />

      <form className="row other-user" onSubmit={(e) => { e.preventDefault(); if (otherId.trim()) navigate(`/users/${otherId.trim()}/posts`); }}>
        <input style={{ flex: 1 }} placeholder="Another user's id" value={otherId} onChange={(e) => setOtherId(e.target.value)} />
        <button>View their posts</button>
      </form>

      <Drawer open={writing} title="Create a post" onClose={() => setWriting(false)}>
        <PostForm onSave={create} onCancel={() => setWriting(false)} />
      </Drawer>
    </>
  );
}
