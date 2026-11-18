import { useState } from 'react';
import { Link } from 'react-router';
import { api, splitList } from '../api.js';
import { useAuth } from '../auth.jsx';
import Drawer from '../Drawer.jsx';
import Pager from '../Pager.jsx';
import { usePaged } from '../usePaged.js';

const empty = { name: '', email: '', password: '', role: 'user', interests: '' };

function UserForm({ initial = empty, onSave, onCancel, isNew }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    const body = { ...form, interests: splitList(form.interests) };
    if (!body.password) delete body.password;
    try {
      await onSave(body);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={submit}>
      <label>
        Name
        <input value={form.name} onChange={set('name')} required />
      </label>
      <label>
        Email
        <input type="email" value={form.email} onChange={set('email')} required />
      </label>
      <label>
        {isNew ? 'Password' : 'New password (leave blank to keep)'}
        <input type="password" value={form.password} onChange={set('password')} required={isNew} />
      </label>
      <label>
        Role
        <select value={form.role} onChange={set('role')}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </label>
      <label>
        Interests
        <input placeholder="chess, reading" value={form.interests} onChange={set('interests')} />
      </label>
      {error && <div className="error">{error}</div>}
      <div className="drawer-actions">
        <button type="button" onClick={onCancel}>Cancel</button>
        <button className="primary">{isNew ? 'Add user' : 'Save'}</button>
      </div>
    </form>
  );
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const paged = usePaged('/users', 20);
  const { items, setItems, error, reload } = paged;
  const [drawer, setDrawer] = useState(null);
  const close = () => setDrawer(null);
  const editing = drawer && drawer !== 'new' ? drawer : null;

  const create = async (body) => {
    await api('/users', { method: 'POST', body });
    reload();
    close();
  };

  const update = async (id, body) => {
    const u = await api(`/users/${id}`, { method: 'PATCH', body });
    setItems((prev) => prev.map((x) => (x._id === id ? u : x)));
    close();
  };

  const remove = async (u) => {
    if (!confirm(`Delete ${u.email}? Their notes and posts go too.`)) return;
    await api(`/users/${u._id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((x) => x._id !== u._id));
  };

  return (
    <>
      <div className="page-head">
        <h2>Users</h2>
        <button className="primary" onClick={() => setDrawer('new')}>Add user</button>
      </div>
      {error && <p className="error">{error}</p>}

      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Interests</th><th /></tr>
        </thead>
        <tbody>
          {items.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.interests.join(', ')}</td>
              <td className="row">
                <button onClick={() => setDrawer(u)}>Edit</button>
                {u._id !== me._id && <button onClick={() => remove(u)}>Delete</button>}
                <Link to={`/admin/notes?owner=${u._id}`}>Notes</Link>
                <Link to={`/users/${u._id}/posts`}>Posts</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pager {...paged} />

      <Drawer open={Boolean(drawer)} title={editing ? `Edit ${editing.name}` : 'Add user'} onClose={close}>
        <UserForm
          key={editing?._id ?? 'new'}
          initial={editing ? { ...empty, name: editing.name, email: editing.email, role: editing.role, interests: editing.interests.join(', ') } : empty}
          onSave={editing ? (b) => update(editing._id, b) : create}
          onCancel={close}
          isNew={!editing}
        />
      </Drawer>
    </>
  );
}
