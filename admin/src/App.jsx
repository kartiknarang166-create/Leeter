import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Colleges from './pages/Colleges';
import './index.css';

function ProtectedRoute({ children }) {
  const { isAuthed } = useAdminAuth();
  if (!isAuthed) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              fontFamily: 'var(--font-display)',
              fontSize: '0.875rem',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
          <Route path="/users/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
          <Route path="/colleges" element={<ProtectedRoute><Colleges /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
