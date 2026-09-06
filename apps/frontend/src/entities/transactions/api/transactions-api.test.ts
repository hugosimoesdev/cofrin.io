import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/shared/api';

import {
  createTransaction,
  deleteTransaction,
  fetchTransactions,
  updateTransaction,
  type TransactionRequest,
} from './transactions-api';

const request: TransactionRequest = {
  transactionDate: '2026-01-06',
  description: 'Coffee',
  amount: '-4.50',
  accountId: 'account-1',
  categoryId: 'category-1',
  notes: null,
};

describe('transactions api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches transactions', async () => {
    const getSpy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [
        {
          id: 'transaction-1',
          transactionDate: '2026-01-06',
          description: 'Coffee',
          amount: -4.5,
          accountId: 'account-1',
          categoryId: 'category-1',
          notes: null,
        },
      ],
    });

    await expect(fetchTransactions()).resolves.toHaveLength(1);
    expect(getSpy).toHaveBeenCalledWith('/api/transactions');
  });

  it('creates transactions', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      data: {
        id: 'transaction-1',
        ...request,
      },
    });

    await createTransaction(request);

    expect(postSpy).toHaveBeenCalledWith('/api/transactions', request);
  });

  it('updates transactions', async () => {
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      data: {
        id: 'transaction-1',
        ...request,
      },
    });

    await updateTransaction('transaction-1', request);

    expect(putSpy).toHaveBeenCalledWith('/api/transactions/transaction-1', request);
  });

  it('deletes transactions', async () => {
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue({});

    await deleteTransaction('transaction-1');

    expect(deleteSpy).toHaveBeenCalledWith('/api/transactions/transaction-1');
  });

  it('rejects when requests fail', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(new Error('description is required.'));

    await expect(createTransaction(request)).rejects.toThrow('description is required.');
  });
});
