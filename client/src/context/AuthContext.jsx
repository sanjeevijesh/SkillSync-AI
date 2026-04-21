import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // Set from localStorage immediately so UI doesn't flash
      setUser(JSON.parse(savedUser));
      // Then fetch fresh data from server to get latest fields
      authAPI.getProfile()
        .then((res) => {
          const fresh = res.data.user;
          const merged = {
            id: fresh._id || fresh.id,
            name: fresh.name,
            email: fresh.email,
            role: fresh.role,
            companyName: fresh.companyName || '',
            resumeUrl: fresh.resumeUrl || '',
            resumeFileName: fresh.resumeFileName || '',
            resumeUploadedAt: fresh.resumeUploadedAt || null,
            avatar: fresh.avatar || '',
          };
          setUser(merged);
          localStorage.setItem('user', JSON.stringify(merged));
        })
        .catch(() => {
          // Token expired or invalid — log out
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      const fullUser = {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName || '',
        resumeUrl: user.resumeUrl || '',
        resumeFileName: user.resumeFileName || '',
        resumeUploadedAt: user.resumeUploadedAt || null,
        avatar: user.avatar || '',
      };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setUser(fullUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      const fullUser = {
        id: user.id || user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName || '',
        resumeUrl: user.resumeUrl || '',
        resumeFileName: user.resumeFileName || '',
        resumeUploadedAt: user.resumeUploadedAt || null,
        avatar: user.avatar || '',
      };
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(fullUser));
      setUser(fullUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  };

  const updateUser = (updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('resumeScore');
    localStorage.removeItem('bookmarks');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};