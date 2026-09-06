import type { Account } from '@/entities/accounts';
import type { Category } from '@/entities/categories';
import type { Transaction, TransactionRequest } from '@/entities/transactions';

export type TransactionRow = {
  clientId: string;
  id: string | null;
  transactionDate: string;
  description: string;
  amount: string;
  accountId: string;
  categoryId: string;
  notes: string;
  isDirty: boolean;
  isDraft: boolean;
  error: string | null;
};

export type TransactionRowInput = Pick<
  TransactionRow,
  'transactionDate' | 'description' | 'amount' | 'accountId' | 'categoryId' | 'notes'
>;

export function formatInputDate(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function createDraftTransactionRow(
  accounts: Account[],
  categories: Category[],
  now = new Date(),
): TransactionRow {
  return {
    clientId: `draft-${crypto.randomUUID()}`,
    id: null,
    transactionDate: formatInputDate(now),
    description: '',
    amount: '',
    accountId: accounts[0]?.id ?? '',
    categoryId: categories[0]?.id ?? '',
    notes: '',
    isDirty: true,
    isDraft: true,
    error: null,
  };
}

export function transactionToRow(transaction: Transaction): TransactionRow {
  return {
    clientId: transaction.id,
    id: transaction.id,
    transactionDate: transaction.transactionDate,
    description: transaction.description,
    amount: String(transaction.amount),
    accountId: transaction.accountId,
    categoryId: transaction.categoryId,
    notes: transaction.notes ?? '',
    isDirty: false,
    isDraft: false,
    error: null,
  };
}

export function validateTransactionRow(row: TransactionRowInput): string | null {
  if (!row.transactionDate) {
    return 'Date is required.';
  }
  if (!row.description.trim()) {
    return 'Description is required.';
  }
  if (!row.amount.trim()) {
    return 'Amount is required.';
  }
  if (!Number.isFinite(Number(row.amount))) {
    return 'Amount must be a valid number.';
  }
  if (!row.accountId) {
    return 'Account is required.';
  }
  if (!row.categoryId) {
    return 'Category is required.';
  }

  return null;
}

function normalizeAmountForCategory(amount: string, categoryId: string, categories: Category[]): string {
  const category = categories.find((currentCategory) => currentCategory.id === categoryId);
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return amount.trim();
  }

  if (category?.type === 'expense') {
    return String(-Math.abs(numericAmount));
  }

  if (category?.type === 'income') {
    return String(Math.abs(numericAmount));
  }

  return amount.trim();
}

export function getSignedTransactionAmount(
  row: TransactionRowInput,
  categories: Category[],
): number | null {
  const amount = Number(row.amount);

  if (!Number.isFinite(amount)) {
    return null;
  }

  const category = categories.find((currentCategory) => currentCategory.id === row.categoryId);

  if (category?.type === 'expense') {
    return -Math.abs(amount);
  }

  if (category?.type === 'income') {
    return Math.abs(amount);
  }

  return amount;
}

export function rowToTransactionRequest(
  row: TransactionRowInput,
  categories: Category[] = [],
): TransactionRequest {
  return {
    transactionDate: row.transactionDate,
    description: row.description.trim(),
    amount: normalizeAmountForCategory(row.amount, row.categoryId, categories),
    accountId: row.accountId,
    categoryId: row.categoryId,
    notes: row.notes.trim() || null,
  };
}
