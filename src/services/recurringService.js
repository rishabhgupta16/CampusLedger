import { api } from './api';

export function getRecurringExpenses() {
  return api.get('/recurring');
}

export function createRecurringExpense(data) {
  return api.post('/recurring', data);
}

export function updateRecurringExpense(id, data) {
  return api.put(`/recurring/${id}`, data);
}

export function deleteRecurringExpense(id) {
  return api.delete(`/recurring/${id}`);
}

export function markRecurringPaid(id) {
  return api.post(`/recurring/${id}/pay`);
}
