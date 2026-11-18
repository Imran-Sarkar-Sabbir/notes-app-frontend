import { useState } from 'react';
import { api } from '../api.js';
import Drawer from '../Drawer.jsx';
import Pager from '../Pager.jsx';
import { usePaged } from '../usePaged.js';

function NoteForm({ initial, onSave, onCancel, label }) {
  const [form, setForm] = useState(initial);
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
        Content
        <textarea placeholder="Write something…" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
      </label>
      {error && <div className="error">{error}</div>}
      <div className="drawer-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button className="primary">{label}</button>
      </div>
    </form>
  );
}

export default function Notes() {
  const paged = usePaged('/notes', 5);
  const { items, setItems, error, loading, reload } = paged;
  const [drawer, setDrawer] = useState(null);
  const close = () => setDrawer(null);

  const create = async (form) => {
    await api('/notes', { method: 'POST', body: form });
    reload();
    close();
  };

  const update = async (id, form) => {
    const note = await api(`/notes/${id}`, { method: 'PATCH', body: form });
    setItems((prev) => prev.map((n) => (n._id === id ? note : n)));
    close();
  };

  const remove = async (id) => {
    if (!confirm('Delete this note?')) return;
    await api(`/notes/${id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((n) => n._id !== id));
  };

  const editing = drawer && drawer !== 'new' ? drawer : null;

  return (
    <>
      <div className="page-head">
        <h2>My notes</h2>
        <button className="primary" onClick={() => setDrawer('new')}>New note</button>
      </div>
      {error && <p className="error">{error}</p>}
      {!loading && items.length === 0 && <p className="muted">No notes yet.</p>}

      {items.map((n) => (
        <div className="card" key={n._id}>
          <div className="row">
            <strong style={{ flex: 1 }}>{n.title}</strong>
            <button onClick={() => setDrawer(n)}>Edit</button>
            <button onClick={() => remove(n._id)}>Delete</button>
          </div>
          {n.content && <pre>{n.content}</pre>}
          <div className="muted">Updated {new Date(n.updatedAt).toLocaleString()}</div>
        </div>
      ))}

      <Pager {...paged} />

      <Drawer open={Boolean(drawer)} title={editing ? 'Edit note' : 'New note'} onClose={close}>
        <NoteForm
          key={editing?._id ?? 'new'}
          initial={editing ? { title: editing.title, content: editing.content } : { title: '', content: '' }}
          onSave={editing ? (f) => update(editing._id, f) : create}
          onCancel={close}
          label={editing ? 'Save' : 'Add note'}
        />
      </Drawer>
    </>
  );
}
