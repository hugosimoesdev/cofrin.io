import { afterEach, describe, expect, it, vi } from 'vitest';

import { createCategory, fetchCategories, type CategoryRequest } from './categories-api';

const request: CategoryRequest = {
  name: 'Groceries',
  type: 'expense',
};

describe('categories api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetches categories', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json([
        {
          id: 'category-1',
          name: 'Groceries',
          type: 'expense',
        },
      ]),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchCategories()).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/categories');
  });

  it('creates categories', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: 'category-1',
        ...request,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await createCategory(request);

    expect(fetchMock).toHaveBeenCalledWith('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  });

  it('uses backend error messages when requests fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ message: 'type is required.' }, { status: 400 })),
    );

    await expect(createCategory(request)).rejects.toThrow('type is required.');
  });
});
