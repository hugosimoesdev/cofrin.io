import type { Account } from '@/entities/accounts';
import type { Category } from '@/entities/categories';
import type { Transaction, TransactionRequest } from '@/entities/transactions';
import type { TranslationKey } from '@/shared/lib';

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

export type TransactionValidationMessages = Record<
  | 'dateRequired'
  | 'descriptionRequired'
  | 'amountRequired'
  | 'amountInvalid'
  | 'accountRequired'
  | 'categoryRequired',
  string
>;

export const transactionValidationMessageKeys = {
  dateRequired: 'transactions.validation.dateRequired',
  descriptionRequired: 'transactions.validation.descriptionRequired',
  amountRequired: 'transactions.validation.amountRequired',
  amountInvalid: 'transactions.validation.amountInvalid',
  accountRequired: 'transactions.validation.accountRequired',
  categoryRequired: 'transactions.validation.categoryRequired',
} satisfies Record<keyof TransactionValidationMessages, TranslationKey>;

const defaultTransactionValidationMessages: TransactionValidationMessages = {
  dateRequired: 'Date is required.',
  descriptionRequired: 'Description is required.',
  amountRequired: 'Amount is required.',
  amountInvalid: 'Amount must be a valid number.',
  accountRequired: 'Account is required.',
  categoryRequired: 'Category is required.',
};

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

export function validateTransactionRow(
  row: TransactionRowInput,
  messages: TransactionValidationMessages = defaultTransactionValidationMessages,
): string | null {
  if (!row.transactionDate) {
    return messages.dateRequired;
  }
  if (!row.description.trim()) {
    return messages.descriptionRequired;
  }
  if (!row.amount.trim()) {
    return messages.amountRequired;
  }
  if (!Number.isFinite(parseTransactionAmount(row.amount))) {
    return messages.amountInvalid;
  }
  if (!row.accountId) {
    return messages.accountRequired;
  }
  if (!row.categoryId) {
    return messages.categoryRequired;
  }

  return null;
}

export function parseTransactionAmount(amount: string): number {
  const trimmedAmount = amount.trim();
  const normalizedAmount = trimmedAmount.includes(',')
    ? trimmedAmount.replace(/\./g, '').replace(',', '.')
    : trimmedAmount;

  return Number(normalizedAmount);
}

function normalizeAmountForCategory(amount: string, categoryId: string, categories: Category[]): string {
  const category = categories.find((currentCategory) => currentCategory.id === categoryId);
  const numericAmount = parseTransactionAmount(amount);

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
  const amount = parseTransactionAmount(row.amount);

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
