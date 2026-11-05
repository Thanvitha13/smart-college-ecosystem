import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });
api.interceptors.request.use((config) => {
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

export const messageFromError = (error) => error.response?.data?.message || error.message || 'Something went wrong.';
export default api;
