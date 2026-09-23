/**
 * Centralized Storage Abstraction Layer
 * Wraps browser localStorage with safe JSON parsing, schema fallbacks, and error handling.
 * Designed to be swappable with backend API endpoints in future milestones.
 */

export const Storage = {
  get(key, defaultValue = null) {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw);
    } catch (error) {
      console.warn(`[Storage] Failed to read key "${key}":`, error);
      return defaultValue;
    }
  },

  set(key, value) {
    if (typeof window === 'undefined') return false;
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error(`[Storage] Failed to write key "${key}":`, error);
      return false;
    }
  },

  remove(key) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`[Storage] Failed to remove key "${key}":`, error);
    }
  },

  clear() {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.clear();
    } catch (error) {
      console.warn('[Storage] Failed to clear storage:', error);
    }
  },
};
