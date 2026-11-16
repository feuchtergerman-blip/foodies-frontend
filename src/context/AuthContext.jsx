import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token') || null);
  const [loading, setLoading] = useState(false);

  // Al iniciar, si hay token, podríamos validar o cargar los datos del usuario
  useEffect(() => {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Petición al endpoint de login de tu backend Laravel
      const response = await api.post('/login', { email, password });
      
      // Suponiendo que tu API regresa { access_token, user: { name, role, restaurant_id } }
      const authToken = response.data.access_token || response.data.token;
      const userData = response.data.user;

      setToken(authToken);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Error de autenticación:', error);
      return { 
        success: false, 
        message: error.response?.data?.errors?.email?.[0] || 'Credenciales incorrectas' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);