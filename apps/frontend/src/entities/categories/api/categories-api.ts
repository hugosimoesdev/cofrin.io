import { queryOptions } from '@tanstack/react-query';

export type Category = {
  id: string;
  name: string;
  type: string;
};

export type CategoryRequest = {
  name: string;
  type: string;
};

type ApiError = {
  message?: string;
};

async function parseApiError(response: Response): Promise<Error> {
  try {
    const error = (await response.json()) as ApiError;
    return new Error(error.message ?? `Categories request failed with ${response.status}`);
  } catch {
    return new Error(`Categories request failed with ${response.status}`);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<T>;
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories');

  return readJson<Category[]>(response);
}

export async function createCategory(request: CategoryRequest): Promise<Category> {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return readJson<Category>(response);
}

export const categoryQueries = {
  all: () => ['categories'] as const,
  list: () =>
    queryOptions({
      queryKey: [...categoryQueries.all(), 'list'] as const,
      queryFn: fetchCategories,
    }),
};
