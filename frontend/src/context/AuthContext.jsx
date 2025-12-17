import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/users/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email); 
    formData.append('password', password);

    // console.log('logging in...', email);
    const response = await api.post('/token', formData);
    const { access_token } = response.data;
    
    localStorage.setItem('token', access_token);
    
    const userResponse = await api.get('/users/me');
    setUser(userResponse.data);
    
    return true;
  };

  const register = async (email, password) => {
    await api.post('/users/', { email, password });
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

