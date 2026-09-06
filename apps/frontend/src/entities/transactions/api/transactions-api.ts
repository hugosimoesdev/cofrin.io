import { queryOptions } from '@tanstack/react-query';

import { apiClient } from '@/shared/api';

export type Transaction = {
  id: string;
  transactionDate: string;
  description: string;
  amount: number | string;
  accountId: string;
  categoryId: string;
  notes: string | null;
};

export type TransactionRequest = {
  transactionDate: string;
  description: string;
  amount: string;
  accountId: string;
  categoryId: string;
  notes: string | null;
};

export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await apiClient.get<Transaction[]>('/api/transactions');

  return response.data;
}

export async function createTransaction(request: TransactionRequest): Promise<Transaction> {
  const response = await apiClient.post<Transaction>('/api/transactions', request);

  return response.data;
}

export async function updateTransaction(
  id: string,
  request: TransactionRequest,
): Promise<Transaction> {
  const response = await apiClient.put<Transaction>(`/api/transactions/${id}`, request);

  return response.data;
}

export async function deleteTransaction(id: string): Promise<void> {
  await apiClient.delete(`/api/transactions/${id}`);
}

export const transactionQueries = {
  all: () => ['transactions'] as const,
  list: () =>
    queryOptions({
      queryKey: [...transactionQueries.all(), 'list'] as const,
      queryFn: fetchTransactions,
    }),
};
