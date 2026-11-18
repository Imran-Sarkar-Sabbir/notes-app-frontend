import { useState } from 'react';
import { api, splitList } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [interests, setInterests] = useState(user.interests.join(', '));
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function save(e) {
    e.preventDefault();
    setMsg('');
    try {
      const body = { name, interests: splitList(interests), ...(password ? { password } : {}) };
      setUser(await api('/auth/me', { method: 'PATCH', body }));
      setPassword('');
      setMsg('Saved');
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <>
      <h2>Profile</h2>
      <p className="muted">
        {user.email} · your user id is <code>{user._id}</code>
      </p>
      <form onSubmit={save}>
        <label>Name <input value={name} onChange={(e) => setName(e.target.value)} required /></label>
        <label>Interests (comma separated) <input value={interests} onChange={(e) => setInterests(e.target.value)} /></label>
        <label>New password (leave blank to keep) <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {msg && <div className={msg === 'Saved' ? 'muted' : 'error'}>{msg}</div>}
        <button className="primary">Save</button>
      </form>
    </>
  );
}
