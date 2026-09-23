import { api } from './api';

export function getTransactions() {
  return api.get('/transactions');
}

export function createTransaction(data) {
  return api.post('/transactions', data);
}

export function updateTransaction(id, data) {
  return api.put(`/transactions/${id}`, data);
}

export function deleteTransaction(id) {
  return api.delete(`/transactions/${id}`);
}
