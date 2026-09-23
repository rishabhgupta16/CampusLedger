/**
 * Centralized fetch() wrapper — the ONLY place in the frontend that should
 * know about the API base URL, request headers, or the JWT storage key.
 * Every service module (authService, and later transactionService etc.)
 * goes through here instead of calling fetch() directly.
 */
import { Storage } from '../utils/storage';
import { APP_CONFIG } from '../constants/appConfig';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getToken() {
  return Storage.get(APP_CONFIG.STORAGE_KEYS.TOKEN, null);
}

export function setToken(token) {
  Storage.set(APP_CONFIG.STORAGE_KEYS.TOKEN, token);
}

export function clearToken() {
  Storage.remove(APP_CONFIG.STORAGE_KEYS.TOKEN);
}

async function request(endpoint, { method = 'GET', body, skipAuth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    const error = new Error('Unable to reach the server. Please check your connection and try again.');
    error.isNetworkError = true;
    throw error;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // No/invalid JSON body (e.g. a 204) — leave data as null.
  }

  if (!response.ok) {
    const error = new Error((data && data.message) || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};
