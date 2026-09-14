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
import { useI18n } from '@/shared/lib';

import {
  createDraftTransactionRow,
  getSignedTransactionAmount,
  rowToTransactionRequest,
  transactionToRow,
  transactionValidationMessageKeys,
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
  pendingBulkDeleteClientIds: string[];
  hasPendingMutation: boolean;
  selectedClientIds: string[];
  selectedRowCount: number;
  isConfirmingBulkDelete: boolean;
  bulkDeleteErrorMessage: string | null;
  updateRow: (clientId: string, field: EditableTransactionField, value: string) => void;
  addDraftRow: () => void;
  saveRow: (row: TransactionRow) => void;
  removeRow: (row: TransactionRow) => void;
  toggleRowSelection: (clientId: string, selected: boolean) => void;
  toggleAllRows: (selected: boolean) => void;
  requestBulkDelete: () => void;
  cancelBulkDelete: () => void;
  confirmBulkDelete: () => void;
};

type BulkDeleteResult = {
  deletedClientIds: string[];
  failedRows: Array<{
    clientId: string;
    error: string;
  }>;
  deletedPersistedRowCount: number;
};

export function useTransactionWorkspace(): TransactionWorkspace {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const transactionsQuery = useQuery(transactionQueries.list());
  const accountsQuery = useQuery(accountQueries.list());
  const categoriesQuery = useQuery(categoryQueries.list());

  const [rows, setRows] = useState<TransactionRow[]>([]);
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);
  const [isConfirmingBulkDelete, setIsConfirmingBulkDelete] = useState(false);
  const [bulkDeleteErrorMessage, setBulkDeleteErrorMessage] = useState<string | null>(null);

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

  useEffect(() => {
    const availableClientIds = new Set(rows.map((row) => row.clientId));

    setSelectedClientIds((currentClientIds) =>
      currentClientIds.filter((clientId) => availableClientIds.has(clientId)),
    );
  }, [rows]);

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
                error: getApiErrorMessage(error, t('transactions.saveError')),
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
      setSelectedClientIds((currentClientIds) =>
        currentClientIds.filter((clientId) => clientId !== row.clientId),
      );
      void queryClient.invalidateQueries({ queryKey: transactionQueries.all() });
    },
    onError: (error, row) => {
      setRows((currentRows) =>
        currentRows.map((currentRow) =>
          currentRow.clientId === row.clientId
            ? {
                ...currentRow,
                error: getApiErrorMessage(error, t('transactions.deleteError')),
              }
            : currentRow,
        ),
      );
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (selectedRows: TransactionRow[]): Promise<BulkDeleteResult> => {
      const draftRows = selectedRows.filter((row) => !row.id);
      const persistedRows = selectedRows.filter((row) => row.id);
      const results = await Promise.allSettled(
        persistedRows.map((row) => deleteTransaction(row.id as string)),
      );
      const deletedClientIds = draftRows.map((row) => row.clientId);
      const failedRows: BulkDeleteResult['failedRows'] = [];

      results.forEach((result, index) => {
        const row = persistedRows[index];

        if (result.status === 'fulfilled') {
          deletedClientIds.push(row.clientId);
          return;
        }

        failedRows.push({
          clientId: row.clientId,
          error: getApiErrorMessage(result.reason, t('transactions.deleteError')),
        });
      });

      return {
        deletedClientIds,
        failedRows,
        deletedPersistedRowCount: deletedClientIds.length - draftRows.length,
      };
    },
    onSuccess: ({ deletedClientIds, failedRows, deletedPersistedRowCount }) => {
      const failedErrorsByClientId = new Map(
        failedRows.map((failedRow) => [failedRow.clientId, failedRow.error]),
      );

      setRows((currentRows) =>
        currentRows
          .filter((row) => !deletedClientIds.includes(row.clientId))
          .map((row) =>
            failedErrorsByClientId.has(row.clientId)
              ? { ...row, error: failedErrorsByClientId.get(row.clientId) ?? row.error }
              : row,
          ),
      );
      setSelectedClientIds((currentClientIds) =>
        currentClientIds.filter((clientId) => !deletedClientIds.includes(clientId)),
      );
      setIsConfirmingBulkDelete(false);
      setBulkDeleteErrorMessage(
        failedRows.length > 0 ? t('transactions.bulkDeletePartialError') : null,
      );

      if (deletedPersistedRowCount > 0) {
        void queryClient.invalidateQueries({ queryKey: transactionQueries.all() });
      }
    },
    onError: (error) => {
      setBulkDeleteErrorMessage(getApiErrorMessage(error, t('transactions.bulkDeleteError')));
    },
  });

  const pendingSaveClientId = saveMutation.isPending
    ? saveMutation.variables.clientId
    : null;
  const pendingDeleteClientId = deleteMutation.isPending
    ? deleteMutation.variables.clientId
    : null;
  const pendingBulkDeleteClientIds = bulkDeleteMutation.isPending
    ? bulkDeleteMutation.variables.map((row) => row.clientId)
    : [];
  const hasPendingMutation =
    saveMutation.isPending || deleteMutation.isPending || bulkDeleteMutation.isPending;
  const selectedRowCount = selectedClientIds.length;

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

    setIsConfirmingBulkDelete(false);
    setRows((currentRows) => [
      createDraftTransactionRow(accounts, categories),
      ...currentRows,
    ]);
  }

  function saveRow(row: TransactionRow) {
    const validationError = validateTransactionRow(row, {
      dateRequired: t(transactionValidationMessageKeys.dateRequired),
      descriptionRequired: t(transactionValidationMessageKeys.descriptionRequired),
      amountRequired: t(transactionValidationMessageKeys.amountRequired),
      amountInvalid: t(transactionValidationMessageKeys.amountInvalid),
      accountRequired: t(transactionValidationMessageKeys.accountRequired),
      categoryRequired: t(transactionValidationMessageKeys.categoryRequired),
    });

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
      setSelectedClientIds((currentClientIds) =>
        currentClientIds.filter((clientId) => clientId !== row.clientId),
      );
      return;
    }

    deleteMutation.mutate(row);
  }

  function toggleRowSelection(clientId: string, selected: boolean) {
    setSelectedClientIds((currentClientIds) => {
      if (selected) {
        return currentClientIds.includes(clientId)
          ? currentClientIds
          : [...currentClientIds, clientId];
      }

      return currentClientIds.filter((currentClientId) => currentClientId !== clientId);
    });
    setIsConfirmingBulkDelete(false);
    setBulkDeleteErrorMessage(null);
  }

  function toggleAllRows(selected: boolean) {
    setSelectedClientIds(selected ? rows.map((row) => row.clientId) : []);
    setIsConfirmingBulkDelete(false);
    setBulkDeleteErrorMessage(null);
  }

  function requestBulkDelete() {
    if (selectedClientIds.length === 0) {
      return;
    }

    setIsConfirmingBulkDelete(true);
    setBulkDeleteErrorMessage(null);
  }

  function cancelBulkDelete() {
    setIsConfirmingBulkDelete(false);
    setBulkDeleteErrorMessage(null);
  }

  function confirmBulkDelete() {
    const selectedRows = rows.filter((row) => selectedClientIds.includes(row.clientId));

    if (selectedRows.length === 0) {
      setIsConfirmingBulkDelete(false);
      return;
    }

    bulkDeleteMutation.mutate(selectedRows);
  }

  return {
    rows,
    accounts,
    categories,
    summary,
    isLoading,
    loadErrorMessage: loadError
      ? getApiErrorMessage(loadError, t('transactions.loadError'))
      : null,
    hasLookups,
    needsAccount,
    needsCategory,
    pendingSaveClientId,
    pendingDeleteClientId,
    pendingBulkDeleteClientIds,
    hasPendingMutation,
    selectedClientIds,
    selectedRowCount,
    isConfirmingBulkDelete,
    bulkDeleteErrorMessage,
    updateRow,
    addDraftRow,
    saveRow,
    removeRow,
    toggleRowSelection,
    toggleAllRows,
    requestBulkDelete,
    cancelBulkDelete,
    confirmBulkDelete,
  };
}
