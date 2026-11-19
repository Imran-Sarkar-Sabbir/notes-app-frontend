import { useState } from 'react';
import { api, setToken, splitList } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [interests, setInterests] = useState(user.interests.join(', '));
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function save(e) {
    e.preventDefault();
    setMsg('');
    try {
      const body = { name, interests: splitList(interests), ...(password ? { password, currentPassword } : {}) };
      const { token, user: updated } = await api('/auth/me', { method: 'PATCH', body });
      setToken(token);
      setUser(updated);
      setPassword('');
      setCurrentPassword('');
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
        {password && (
          <label>Current password <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></label>
        )}
        {msg && <div className={msg === 'Saved' ? 'muted' : 'error'}>{msg}</div>}
        <button className="primary">Save</button>
      </form>
    </>
  );
}
