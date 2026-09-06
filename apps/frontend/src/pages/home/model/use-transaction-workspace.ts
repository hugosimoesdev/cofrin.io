import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountQueries, createAccount, type Account } from '@/entities/accounts';
import { categoryQueries, createCategory, type Category } from '@/entities/categories';
import {
  createTransaction,
  deleteTransaction,
  transactionQueries,
  updateTransaction,
} from '@/entities/transactions';

import {
  createDraftTransactionRow,
  rowToTransactionRequest,
  transactionToRow,
  validateTransactionRow,
  type TransactionRow,
} from './transaction-sheet';

export type EditableTransactionField = keyof Pick<
  TransactionRow,
  'transactionDate' | 'description' | 'amount' | 'accountId' | 'categoryId' | 'notes'
>;

export type AccountForm = {
  name: string;
  type: string;
  initialBalance: string;
};

export type CategoryForm = {
  name: string;
  type: string;
};

export type TransactionSummary = {
  income: number;
  expenses: number;
  balance: number;
};

export type TransactionWorkspace = {
  rows: TransactionRow[];
  accounts: Account[];
  categories: Category[];
  summary: TransactionSummary;
  isLoading: boolean;
  loadErrorMessage: string | null;
  hasLookups: boolean;
  showSetup: boolean;
  needsAccount: boolean;
  needsCategory: boolean;
  accountForm: AccountForm;
  categoryForm: CategoryForm;
  accountFormError: string | null;
  categoryFormError: string | null;
  isCreatingAccount: boolean;
  isCreatingCategory: boolean;
  pendingSaveClientId: string | null;
  pendingDeleteClientId: string | null;
  hasPendingMutation: boolean;
  updateAccountForm: (field: keyof AccountForm, value: string) => void;
  updateCategoryForm: (field: keyof CategoryForm, value: string) => void;
  submitAccountForm: () => void;
  submitCategoryForm: () => void;
  updateRow: (clientId: string, field: EditableTransactionField, value: string) => void;
  addDraftRow: () => void;
  saveRow: (row: TransactionRow) => void;
  removeRow: (row: TransactionRow) => void;
};

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function useTransactionWorkspace(): TransactionWorkspace {
  const queryClient = useQueryClient();
  const transactionsQuery = useQuery(transactionQueries.list());
  const accountsQuery = useQuery(accountQueries.list());
  const categoriesQuery = useQuery(categoryQueries.list());

  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [accountForm, setAccountForm] = useState<AccountForm>({
    name: '',
    type: 'cash',
    initialBalance: '0',
  });
  const [categoryForm, setCategoryForm] = useState<CategoryForm>({
    name: '',
    type: 'expense',
  });
  const [accountFormError, setAccountFormError] = useState<string | null>(null);
  const [categoryFormError, setCategoryFormError] = useState<string | null>(null);

  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const hasLookups = accounts.length > 0 && categories.length > 0;
  const needsAccount = accountsQuery.isSuccess && accounts.length === 0;
  const needsCategory = categoriesQuery.isSuccess && categories.length === 0;
  const showSetup = needsAccount || needsCategory;
  const isLoading =
    transactionsQuery.isLoading || accountsQuery.isLoading || categoriesQuery.isLoading;
  const loadError = transactionsQuery.error ?? accountsQuery.error ?? categoriesQuery.error;

  const summary = useMemo<TransactionSummary>(() => {
    const totals = rows.reduce(
      (currentSummary, row) => {
        const amount = Number(row.amount);

        if (!Number.isFinite(amount)) {
          return currentSummary;
        }

        if (amount >= 0) {
          return { ...currentSummary, income: currentSummary.income + amount };
        }

        return { ...currentSummary, expenses: currentSummary.expenses + amount };
      },
      { income: 0, expenses: 0 },
    );

    return {
      ...totals,
      balance: totals.income + totals.expenses,
    };
  }, [rows]);

  useEffect(() => {
    if (!transactionsQuery.data) {
      return;
    }

    setRows((currentRows) => {
      const hasUnsavedRows = currentRows.some((row) => row.isDirty || row.isDraft);

      return hasUnsavedRows ? currentRows : transactionsQuery.data.map(transactionToRow);
    });
  }, [transactionsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (row: TransactionRow) => {
      const request = rowToTransactionRequest(row);

      return row.id ? updateTransaction(row.id, request) : createTransaction(request);
    },
    onSuccess: (savedTransaction, row) => {
      const savedRow = transactionToRow(savedTransaction);

      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.clientId === row.clientId ? savedRow : currentRow,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: transactionQueries.all() });
    },
    onError: (error, row) => {
      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.clientId === row.clientId
            ? {
                ...currentRow,
                error: getErrorMessage(error, 'Could not save transaction.'),
              }
            : currentRow,
        ),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (row: TransactionRow) => {
      if (!row.id) {
        return Promise.resolve();
      }

      return deleteTransaction(row.id);
    },
    onSuccess: (_result, row) => {
      setRows((currentRows) =>
        currentRows.filter((currentRow) => currentRow.clientId !== row.clientId),
      );
      void queryClient.invalidateQueries({ queryKey: transactionQueries.all() });
    },
    onError: (error, row) => {
      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.clientId === row.clientId
            ? {
                ...currentRow,
                error: getErrorMessage(error, 'Could not delete transaction.'),
              }
            : currentRow,
        ),
      );
    },
  });

  const createAccountMutation = useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      setAccountForm({ name: '', type: 'cash', initialBalance: '0' });
      setAccountFormError(null);
      void queryClient.invalidateQueries({ queryKey: accountQueries.all() });
    },
    onError: (error) => {
      setAccountFormError(getErrorMessage(error, 'Could not create account.'));
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setCategoryForm({ name: '', type: 'expense' });
      setCategoryFormError(null);
      void queryClient.invalidateQueries({ queryKey: categoryQueries.all() });
    },
    onError: (error) => {
      setCategoryFormError(getErrorMessage(error, 'Could not create category.'));
    },
  });

  const pendingSaveClientId = saveMutation.isPending
    ? saveMutation.variables.clientId
    : null;
  const pendingDeleteClientId = deleteMutation.isPending
    ? deleteMutation.variables.clientId
    : null;
  const hasPendingMutation =
    saveMutation.isPending ||
    deleteMutation.isPending ||
    createAccountMutation.isPending ||
    createCategoryMutation.isPending;

  function updateAccountForm(field: keyof AccountForm, value: string) {
    setAccountForm((currentForm) => ({ ...currentForm, [field]: value }));
    setAccountFormError(null);
  }

  function updateCategoryForm(field: keyof CategoryForm, value: string) {
    setCategoryForm((currentForm) => ({ ...currentForm, [field]: value }));
    setCategoryFormError(null);
  }

  function submitAccountForm() {
    if (!accountForm.name.trim()) {
      setAccountFormError('Account name is required.');
      return;
    }
    if (!accountForm.type.trim()) {
      setAccountFormError('Account type is required.');
      return;
    }
    if (!accountForm.initialBalance.trim()) {
      setAccountFormError('Initial balance is required.');
      return;
    }
    if (!Number.isFinite(Number(accountForm.initialBalance))) {
      setAccountFormError('Initial balance must be a valid number.');
      return;
    }

    createAccountMutation.mutate({
      name: accountForm.name.trim(),
      type: accountForm.type.trim(),
      initialBalance: accountForm.initialBalance.trim(),
    });
  }

  function submitCategoryForm() {
    if (!categoryForm.name.trim()) {
      setCategoryFormError('Category name is required.');
      return;
    }
    if (!categoryForm.type.trim()) {
      setCategoryFormError('Category type is required.');
      return;
    }

    createCategoryMutation.mutate({
      name: categoryForm.name.trim(),
      type: categoryForm.type.trim(),
    });
  }

  function updateRow(clientId: string, field: EditableTransactionField, value: string) {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.clientId === clientId
          ? {
              ...row,
              [field]: value,
              isDirty: true,
              error: null,
            }
          : row,
      ),
    );
  }

  function addDraftRow() {
    if (!hasLookups) {
      return;
    }

    setRows((currentRows) => [
      createDraftTransactionRow(accounts, categories),
      ...currentRows,
    ]);
  }

  function saveRow(row: TransactionRow) {
    const validationError = validateTransactionRow(row);

    if (validationError) {
      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.clientId === row.clientId
            ? { ...currentRow, error: validationError }
            : currentRow,
        ),
      );
      return;
    }

    saveMutation.mutate(row);
  }

  function removeRow(row: TransactionRow) {
    if (!row.id) {
      setRows((currentRows) =>
        currentRows.filter((currentRow) => currentRow.clientId !== row.clientId),
      );
      return;
    }

    deleteMutation.mutate(row);
  }

  return {
    rows,
    accounts,
    categories,
    summary,
    isLoading,
    loadErrorMessage: loadError ? getErrorMessage(loadError, 'Could not load transactions.') : null,
    hasLookups,
    showSetup,
    needsAccount,
    needsCategory,
    accountForm,
    categoryForm,
    accountFormError,
    categoryFormError,
    isCreatingAccount: createAccountMutation.isPending,
    isCreatingCategory: createCategoryMutation.isPending,
    pendingSaveClientId,
    pendingDeleteClientId,
    hasPendingMutation,
    updateAccountForm,
    updateCategoryForm,
    submitAccountForm,
    submitCategoryForm,
    updateRow,
    addDraftRow,
    saveRow,
    removeRow,
  };
}
