import { Navigate, NavLink, Route, Routes } from 'react-router';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx';
import Notes from './pages/Notes.jsx';
import Posts from './pages/Posts.jsx';
import Profile from './pages/Profile.jsx';
import AdminUsers from './pages/AdminUsers.jsx';
import AdminNotes from './pages/AdminNotes.jsx';
import Interests from './pages/Interests.jsx';

function Protected({ admin, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const { user, loading, logout } = useAuth();
  if (loading) return <main>Loading…</main>;

  return (
    <>
      {user && (
        <nav>
          <NavLink to="/">My notes</NavLink>
          <NavLink to={`/users/${user._id}/posts`}>Posts</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          {user.role === 'admin' && (
            <>
              <NavLink to="/admin/users">Users</NavLink>
              <NavLink to="/admin/notes">All notes</NavLink>
              <NavLink to="/admin/interests">By interest</NavLink>
            </>
          )}
          <span className="spacer" />
          <span className="muted">
            {user.name} ({user.role})
          </span>
          <button onClick={logout}>Log out</button>
        </nav>
      )}
      <main>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/" element={<Protected><Notes /></Protected>} />
          <Route path="/users/:id/posts" element={<Protected><Posts /></Protected>} />
          <Route path="/profile" element={<Protected><Profile /></Protected>} />
          <Route path="/admin/users" element={<Protected admin><AdminUsers /></Protected>} />
          <Route path="/admin/notes" element={<Protected admin><AdminNotes /></Protected>} />
          <Route path="/admin/interests" element={<Protected admin><Interests /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
