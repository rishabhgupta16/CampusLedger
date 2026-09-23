import { api } from './api';

export function getBudget() {
  return api.get('/budget');
}

export function updateBudget(data) {
  return api.put('/budget', data);
}
