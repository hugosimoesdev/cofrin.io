import { queryOptions } from '@tanstack/react-query';

import { apiClient } from '@/shared/api';

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

export async function fetchAccounts(): Promise<Account[]> {
  const response = await apiClient.get<Account[]>('/api/accounts');

  return response.data;
}

export async function createAccount(request: AccountRequest): Promise<Account> {
  const response = await apiClient.post<Account>('/api/accounts', request);

  return response.data;
}

export async function updateAccount(id: string, request: AccountRequest): Promise<Account> {
  const response = await apiClient.put<Account>(`/api/accounts/${id}`, request);

  return response.data;
}

export async function deleteAccount(id: string): Promise<void> {
  await apiClient.delete(`/api/accounts/${id}`);
}

export const accountQueries = {
  all: () => ['accounts'] as const,
  list: () =>
    queryOptions({
      queryKey: [...accountQueries.all(), 'list'] as const,
      queryFn: fetchAccounts,
    }),
};
