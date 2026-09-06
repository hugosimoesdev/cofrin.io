import { queryOptions } from '@tanstack/react-query';

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

type ApiError = {
  message?: string;
};

async function parseApiError(response: Response): Promise<Error> {
  try {
    const error = (await response.json()) as ApiError;
    return new Error(error.message ?? `Transaction request failed with ${response.status}`);
  } catch {
    return new Error(`Transaction request failed with ${response.status}`);
  }
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseApiError(response);
  }

  return response.json() as Promise<T>;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch('/api/transactions');

  return readJson<Transaction[]>(response);
}

export async function createTransaction(request: TransactionRequest): Promise<Transaction> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return readJson<Transaction>(response);
}

export async function updateTransaction(
  id: string,
  request: TransactionRequest,
): Promise<Transaction> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return readJson<Transaction>(response);
}

export async function deleteTransaction(id: string): Promise<void> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }
}

export const transactionQueries = {
  all: () => ['transactions'] as const,
  list: () =>
    queryOptions({
      queryKey: [...transactionQueries.all(), 'list'] as const,
      queryFn: fetchTransactions,
    }),
};
