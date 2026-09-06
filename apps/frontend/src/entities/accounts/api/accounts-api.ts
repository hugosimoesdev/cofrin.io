import { queryOptions } from '@tanstack/react-query';

export type Account = {
  id: string;
  name: string;
  type: string;
  initialBalance: number | string;
};

export type AccountRequest = {
  name: string;
  type: string;
  initialBalance: string;
};

type ApiError = {
  message?: string;
};

async function parseApiError(response: Response): Promise<Error> {
  try {
    const error = (await response.json()) as ApiError;
    return new Error(error.message ?? `Accounts request failed with ${response.status}`);
  } catch {
    return new Error(`Accounts request failed with ${response.status}`);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<T>;
}

export async function fetchAccounts(): Promise<Account[]> {
  const response = await fetch('/api/accounts');

  return readJson<Account[]>(response);
}

export async function createAccount(request: AccountRequest): Promise<Account> {
  const response = await fetch('/api/accounts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return readJson<Account>(response);
}

export async function updateAccount(id: string, request: AccountRequest): Promise<Account> {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return readJson<Account>(response);
}

export async function deleteAccount(id: string): Promise<void> {
  const response = await fetch(`/api/accounts/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }
}

export const accountQueries = {
  all: () => ['accounts'] as const,
  list: () =>
    queryOptions({
      queryKey: [...accountQueries.all(), 'list'] as const,
      queryFn: fetchAccounts,
    }),
};
