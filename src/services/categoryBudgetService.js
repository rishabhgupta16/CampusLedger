import { api } from './api';

export function getCategoryBudgets() {
  return api.get('/category-budgets');
}

export function createCategoryBudget(data) {
  return api.post('/category-budgets', data);
}

export function updateCategoryBudget(id, data) {
  return api.put(`/category-budgets/${id}`, data);
}

export function deleteCategoryBudget(id) {
  return api.delete(`/category-budgets/${id}`);
}
