import { createContext, useContext, useState } from 'react';
import api from '../lib/api';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAuthed, setIsAuthed] = useState(() => !!localStorage.getItem('admin_secret'));

  const login = async (secret) => {
    // Test the secret against the backend
    localStorage.setItem('admin_secret', secret);
    try {
      await api.get('/admin/stats');
      setIsAuthed(true);
      return true;
    } catch {
      localStorage.removeItem('admin_secret');
      setIsAuthed(false);
      throw new Error('Invalid admin secret');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_secret');
    setIsAuthed(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthed, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
