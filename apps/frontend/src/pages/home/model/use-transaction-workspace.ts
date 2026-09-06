import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountQueries, type Account } from '@/entities/accounts';
import { categoryQueries, type Category } from '@/entities/categories';
import {
  createTransaction,
  deleteTransaction,
  transactionQueries,
  updateTransaction,
} from '@/entities/transactions';
import { getApiErrorMessage } from '@/shared/api';

import {
  createDraftTransactionRow,
  getSignedTransactionAmount,
  rowToTransactionRequest,
  transactionToRow,
  validateTransactionRow,
  type TransactionRow,
} from './transaction-sheet';

export type EditableTransactionField = keyof Pick<
  TransactionRow,
  'transactionDate' | 'description' | 'amount' | 'accountId' | 'categoryId' | 'notes'
>;

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
  needsAccount: boolean;
  needsCategory: boolean;
  pendingSaveClientId: string | null;
  pendingDeleteClientId: string | null;
  hasPendingMutation: boolean;
  updateRow: (clientId: string, field: EditableTransactionField, value: string) => void;
  addDraftRow: () => void;
  saveRow: (row: TransactionRow) => void;
  removeRow: (row: TransactionRow) => void;
};

export function useTransactionWorkspace(): TransactionWorkspace {
  const queryClient = useQueryClient();
  const transactionsQuery = useQuery(transactionQueries.list());
  const accountsQuery = useQuery(accountQueries.list());
  const categoriesQuery = useQuery(categoryQueries.list());

  const [rows, setRows] = useState<TransactionRow[]>([]);

  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const hasLookups = accounts.length > 0 && categories.length > 0;
  const needsAccount = accountsQuery.isSuccess && accounts.length === 0;
  const needsCategory = categoriesQuery.isSuccess && categories.length === 0;
  const isLoading =
    transactionsQuery.isLoading || accountsQuery.isLoading || categoriesQuery.isLoading;
  const loadError = transactionsQuery.error ?? accountsQuery.error ?? categoriesQuery.error;

  const summary = useMemo<TransactionSummary>(() => {
    const totals = rows.reduce(
      (currentSummary, row) => {
        const amount = getSignedTransactionAmount(row, categories);

        if (amount === null) {
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
  }, [categories, rows]);

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
      const request = rowToTransactionRequest(row, categories);

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
                error: getApiErrorMessage(error, 'Could not save transaction.'),
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
                error: getApiErrorMessage(error, 'Could not delete transaction.'),
              }
            : currentRow,
        ),
      );
    },
  });

  const pendingSaveClientId = saveMutation.isPending
    ? saveMutation.variables.clientId
    : null;
  const pendingDeleteClientId = deleteMutation.isPending
    ? deleteMutation.variables.clientId
    : null;
  const hasPendingMutation = saveMutation.isPending || deleteMutation.isPending;

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
    loadErrorMessage: loadError
      ? getApiErrorMessage(loadError, 'Could not load transactions.')
      : null,
    hasLookups,
    needsAccount,
    needsCategory,
    pendingSaveClientId,
    pendingDeleteClientId,
    hasPendingMutation,
    updateRow,
    addDraftRow,
    saveRow,
    removeRow,
  };
}
