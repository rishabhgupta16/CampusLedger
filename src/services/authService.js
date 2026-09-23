import { api, setToken } from './api';

export async function register({ name, email, password }) {
  const data = await api.post('/auth/register', { name, email, password }, { skipAuth: true });
  if (data?.token) setToken(data.token);
  return data;
}

export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password }, { skipAuth: true });
  if (data?.token) setToken(data.token);
  return data;
}

export async function getCurrentUser() {
  return api.get('/auth/me');
}
