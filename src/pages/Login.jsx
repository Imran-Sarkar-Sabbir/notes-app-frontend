import { useState } from 'react';
import { useAuth } from '../auth.jsx';
import { splitList } from '../api.js';

export default function Login() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', interests: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      if (mode === 'login') {
        await signIn('/auth/login', { email: form.email, password: form.password });
      } else {
        await signIn('/auth/register', { ...form, interests: splitList(form.interests) });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-box">
      <h2>{mode === 'login' ? 'Log in' : 'Create an account'}</h2>
      <form onSubmit={submit}>
        {mode === 'register' && <input placeholder="Name" value={form.name} onChange={set('name')} required />}
        <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input type="password" placeholder="Password (8+ characters)" value={form.password} onChange={set('password')} required />
        {mode === 'register' && (
          <input placeholder="Interests, comma separated (e.g. chess, reading)" value={form.interests} onChange={set('interests')} />
        )}
        {error && <div className="error">{error}</div>}
        <button className="primary">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
      </form>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
      </button>
    </div>
  );
}
