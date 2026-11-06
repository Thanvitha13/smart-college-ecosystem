import axios from 'axios';

const apiOrigin = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const api = axios.create({ baseURL: `${apiOrigin}/api`, timeout: 15000 });

export const assetUrl = (url) => url?.startsWith('/uploads/') && apiOrigin ? `${apiOrigin}${url}` : url;

api.interceptors.request.use((config) => {
  if (import.meta.env.PROD && !apiOrigin) {
    return Promise.reject(new Error('The API is not configured. In Vercel, set VITE_API_URL to your Render service URL without /api, then redeploy.'));
  }
  const token = localStorage.getItem('opportunityhub-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
    localStorage.removeItem('opportunityhub-token');
    window.dispatchEvent(new Event('opportunityhub:unauthorized'));
  }
  return Promise.reject(error);
});

export const messageFromError = (error) => {
  if (error.response?.status === 404) {
    return 'The API returned 404. In Vercel, set VITE_API_URL to your Render service URL without /api, then redeploy.';
  }
  return error.response?.data?.message || error.message || 'Something went wrong.';
};
export default api;
