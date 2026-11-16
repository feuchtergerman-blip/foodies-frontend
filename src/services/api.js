import axios from 'axios';

const api = axios.create({
  baseURL: 'http://143.110.228.80/api', // Cambiar a http://127.0.0.1:8000/api si pruebas localmente
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Interceptor para inyectar el token Bearer de Sanctum automáticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;