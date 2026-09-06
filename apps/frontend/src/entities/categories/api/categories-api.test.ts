import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/shared/api';

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
  type CategoryRequest,
} from './categories-api';

const request: CategoryRequest = {
  name: 'Groceries',
  type: 'expense',
};

describe('categories api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches categories', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [
        {
          id: 'category-1',
          name: 'Groceries',
          type: 'expense',
        },
      ],
    });

    await expect(fetchCategories()).resolves.toHaveLength(1);
    expect(getSpy).toHaveBeenCalledWith('/api/categories');
  });

  it('creates categories', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        id: 'category-1',
        ...request,
      },
    });

    await createCategory(request);

    expect(postSpy).toHaveBeenCalledWith('/api/categories', request);
  });

  it('updates categories', async () => {
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      data: {
        id: 'category-1',
        ...request,
      },
    });

    await updateCategory('category-1', request);

    expect(putSpy).toHaveBeenCalledWith('/api/categories/category-1', request);
  });

  it('deletes categories', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({});

    await deleteCategory('category-1');

    expect(deleteSpy).toHaveBeenCalledWith('/api/categories/category-1');
  });

  it('rejects when requests fail', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('type is required.'));

    await expect(createCategory(request)).rejects.toThrow('type is required.');
  });
});
