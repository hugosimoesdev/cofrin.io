import { afterEach, describe, expect, it, vi } from 'vitest';

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
    vi.unstubAllGlobals();
  });

  it('fetches transactions', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json([
        {
          id: 'transaction-1',
          transactionDate: '2026-01-06',
          description: 'Coffee',
          amount: -4.5,
          accountId: 'account-1',
          categoryId: 'category-1',
          notes: null,
        },
      ]),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchTransactions()).resolves.toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith('/api/transactions');
  });

  it('creates transactions', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: 'transaction-1',
        ...request,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await createTransaction(request);

    expect(fetchMock).toHaveBeenCalledWith('/api/transactions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  });

  it('updates transactions', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        id: 'transaction-1',
        ...request,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await updateTransaction('transaction-1', request);

    expect(fetchMock).toHaveBeenCalledWith('/api/transactions/transaction-1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
  });

  it('deletes transactions', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);

    await deleteTransaction('transaction-1');

    expect(fetchMock).toHaveBeenCalledWith('/api/transactions/transaction-1', {
      method: 'DELETE',
    });
  });

  it('uses backend error messages when requests fail', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(Response.json({ message: 'description is required.' }, { status: 400 })),
    );

    await expect(createTransaction(request)).rejects.toThrow('description is required.');
  });
});
