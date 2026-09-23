import { api } from './api';

export function getGoals() {
  return api.get('/goals');
}

export function createGoal(data) {
  return api.post('/goals', data);
}

export function updateGoal(id, data) {
  return api.put(`/goals/${id}`, data);
}

export function deleteGoal(id) {
  return api.delete(`/goals/${id}`);
}

export function addMoney(id, amount) {
  return api.post(`/goals/${id}/add-money`, { amount });
}
