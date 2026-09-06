import { queryOptions } from '@tanstack/react-query';

import { apiClient } from '@/shared/api';

export type Category = {
  id: string;
  name: string;
  type: string;
};

export type CategoryRequest = {
  name: string;
  type: string;
};

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiClient.get<Category[]>('/api/categories');

  return response.data;
}

export async function createCategory(request: CategoryRequest): Promise<Category> {
  const response = await apiClient.post<Category>('/api/categories', request);

  return response.data;
}

export async function updateCategory(
  id: string,
  request: CategoryRequest,
): Promise<Category> {
  const response = await apiClient.put<Category>(`/api/categories/${id}`, request);

  return response.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/api/categories/${id}`);
}

export const categoryQueries = {
  all: () => ['categories'] as const,
  list: () =>
    queryOptions({
      queryKey: [...categoryQueries.all(), 'list'] as const,
      queryFn: fetchCategories,
    }),
};
