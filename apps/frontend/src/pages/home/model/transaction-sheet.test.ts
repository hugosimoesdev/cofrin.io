import { describe, expect, it, vi } from 'vitest';

import {
  createDraftTransactionRow,
  formatInputDate,
  rowToTransactionRequest,
  transactionToRow,
  validateTransactionRow,
} from './transaction-sheet';

describe('transaction sheet model', () => {
  it('formats dates for date inputs', () => {
    expect(formatInputDate(new Date(2026, 0, 6))).toBe('2026-01-06');
  });

  it('creates draft rows with lookup defaults', () => {
    vi.stubGlobal('crypto', {
      randomUUID: () => 'draft-id',
    });

    const row = createDraftTransactionRow(
      [{ id: 'account-1', name: 'Wallet', type: 'cash', initialBalance: 0 }],
      [{ id: 'category-1', name: 'Groceries', type: 'expense' }],
      new Date(2026, 0, 6),
    );

    expect(row).toMatchObject({
      clientId: 'draft-draft-id',
      id: null,
      transactionDate: '2026-01-06',
      accountId: 'account-1',
      categoryId: 'category-1',
      isDraft: true,
      isDirty: true,
    });

    vi.unstubAllGlobals();
  });

  it('maps backend transactions to editable rows', () => {
    expect(
      transactionToRow({
        id: 'transaction-1',
        transactionDate: '2026-01-06',
        description: 'Weekly groceries',
        amount: -125.45,
        accountId: 'account-1',
        categoryId: 'category-1',
        notes: null,
      }),
    ).toEqual({
      clientId: 'transaction-1',
      id: 'transaction-1',
      transactionDate: '2026-01-06',
      description: 'Weekly groceries',
      amount: '-125.45',
      accountId: 'account-1',
      categoryId: 'category-1',
      notes: '',
      isDirty: false,
      isDraft: false,
      error: null,
    });
  });

  it('validates required fields before saving', () => {
    expect(
      validateTransactionRow({
        transactionDate: '2026-01-06',
        description: '',
        amount: '10',
        accountId: 'account-1',
        categoryId: 'category-1',
        notes: '',
      }),
    ).toBe('Description is required.');

    expect(
      validateTransactionRow({
        transactionDate: '2026-01-06',
        description: 'Coffee',
        amount: 'ten',
        accountId: 'account-1',
        categoryId: 'category-1',
        notes: '',
      }),
    ).toBe('Amount must be a valid number.');
  });

  it('normalizes rows into transaction requests', () => {
    expect(
      rowToTransactionRequest({
        transactionDate: '2026-01-06',
        description: '  Coffee  ',
        amount: ' -4.50 ',
        accountId: 'account-1',
        categoryId: 'category-1',
        notes: '  quick stop  ',
      }),
    ).toEqual({
      transactionDate: '2026-01-06',
      description: 'Coffee',
      amount: '-4.50',
      accountId: 'account-1',
      categoryId: 'category-1',
      notes: 'quick stop',
    });
  });
});
