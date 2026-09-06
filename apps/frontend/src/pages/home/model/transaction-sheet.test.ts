import { describe, expect, it, vi } from 'vitest';

import {
  createDraftTransactionRow,
  formatInputDate,
  getSignedTransactionAmount,
  parseTransactionAmount,
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

  it('parses decimal amounts from English and Brazilian input formats', () => {
    expect(parseTransactionAmount('69.90')).toBe(69.9);
    expect(parseTransactionAmount('69,90')).toBe(69.9);
    expect(parseTransactionAmount('1.234,56')).toBe(1234.56);
  });

  it('accepts translated validation messages', () => {
    expect(
      validateTransactionRow(
        {
          transactionDate: '',
          description: 'Coffee',
          amount: '10',
          accountId: 'account-1',
          categoryId: 'category-1',
          notes: '',
        },
        {
          dateRequired: 'A data é obrigatória.',
          descriptionRequired: 'A descrição é obrigatória.',
          amountRequired: 'O valor é obrigatório.',
          amountInvalid: 'O valor deve ser um número válido.',
          accountRequired: 'A conta é obrigatória.',
          categoryRequired: 'A categoria é obrigatória.',
        },
      ),
    ).toBe('A data é obrigatória.');
  });

  it('normalizes rows into transaction requests', () => {
    expect(
      rowToTransactionRequest(
        {
          transactionDate: '2026-01-06',
          description: '  Coffee  ',
          amount: ' -4.50 ',
          accountId: 'account-1',
          categoryId: 'category-1',
          notes: '  quick stop  ',
        },
        [{ id: 'category-1', name: 'Groceries', type: 'expense' }],
      ),
    ).toEqual({
      transactionDate: '2026-01-06',
      description: 'Coffee',
      amount: '-4.5',
      accountId: 'account-1',
      categoryId: 'category-1',
      notes: 'quick stop',
    });
  });

  it('normalizes Brazilian decimal amounts into transaction requests', () => {
    expect(
      rowToTransactionRequest(
        {
          transactionDate: '2026-01-06',
          description: 'Roupa',
          amount: '69,90',
          accountId: 'account-1',
          categoryId: 'category-1',
          notes: '',
        },
        [{ id: 'category-1', name: 'Clothes', type: 'expense' }],
      ).amount,
    ).toBe('-69.9');
  });

  it('uses category type to sign transaction amounts', () => {
    const categories = [
      { id: 'category-1', name: 'Clothes', type: 'expense' },
      { id: 'category-2', name: 'Salary', type: 'income' },
    ];

    expect(
      getSignedTransactionAmount(
        {
          transactionDate: '2026-01-06',
          description: 'Shirt',
          amount: '50',
          accountId: 'account-1',
          categoryId: 'category-1',
          notes: '',
        },
        categories,
      ),
    ).toBe(-50);

    expect(
      rowToTransactionRequest(
        {
          transactionDate: '2026-01-06',
          description: 'Salary',
          amount: '-1000',
          accountId: 'account-1',
          categoryId: 'category-2',
          notes: '',
        },
        categories,
      ).amount,
    ).toBe('1000');
  });
});
