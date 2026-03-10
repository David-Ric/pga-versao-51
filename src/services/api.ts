import axios from 'axios';
import { iDadosUsuario } from '../@types';

const api = axios.create({
  baseURL: 'https://pga.cigel.com.br:8095/',
  //baseURL: 'http://10.0.0.158:8091/',
  //baseURL: 'https://localhost:8095/',
  timeout: 8000,
  headers: {
    'Content-type': 'application/json',
  },
});

function getToken(): string | null {
  const usuario: iDadosUsuario = JSON.parse(
    localStorage.getItem('@Portal/usuario') || '{}'
  );
  const token = usuario.token || null;
  if (token) {
    console.log('Token:', token);
    return token;
  } else {
    console.error('Token não encontrado no localStorage');
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getToken();
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    try {
      const evt = new CustomEvent('api-status', {
        detail: { ok: true, status: response?.status || 200 },
      });
      window.dispatchEvent(evt);
    } catch {}
    return response;
  },
  (error) => {
    try {
      const isNetworkError =
        !error?.response ||
        error?.code === 'ECONNABORTED' ||
        String(error?.message || '').toLowerCase().includes('network error');
      const evt = new CustomEvent('api-status', {
        detail: { ok: !isNetworkError, status: error?.response?.status || 0 },
      });
      window.dispatchEvent(evt);
    } catch {}
    return Promise.reject(error);
  }
);

export default api;
