import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { accountQueries, type Account } from '@/entities/accounts';
import { categoryQueries, type Category } from '@/entities/categories';
import {
  commitImport,
  previewImport,
  type ImportCommitItemRequest,
  type ImportPreview,
} from '@/entities/imports';
import { transactionQueries } from '@/entities/transactions';
import { getApiErrorMessage } from '@/shared/api';
import { useI18n, type TranslationKey } from '@/shared/lib';

import type { ImportWarning, PreviewTransaction } from '@/entities/imports';

type ImportPreviewSuccess = {
  fileName: string;
  preview: ImportPreview;
};

type ImportPreviewFailure = {
  fileName: string;
  errorMessage: string;
};

export type ImportPreviewResult = ImportPreviewSuccess | ImportPreviewFailure;

export type CombinedPreviewTransaction = PreviewTransaction & {
  fileName: string;
};

export type CombinedImportPreview = Omit<ImportPreview, 'transactions' | 'warnings'> & {
  successfulFileCount: number;
  failedFileCount: number;
  transactions: CombinedPreviewTransaction[];
  warnings: ImportWarning[];
};

export type ImportEditableField =
  | 'transactionDate'
  | 'description'
  | 'amount'
  | 'accountId'
  | 'categoryId'
  | 'notes';

export type ImportPreviewRow = CombinedPreviewTransaction & {
  clientId: string;
  selected: boolean;
  accountId: string;
  categoryId: string;
  notes: string;
  error: string | null;
  isEditing: boolean;
};

export type EditableImportPreview = Omit<CombinedImportPreview, 'transactions'> & {
  transactions: ImportPreviewRow[];
};

export type ImportPreviewWorkspace = {
  selectedFiles: File[];
  preview: EditableImportPreview | null;
  accounts: Account[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  defaultAccountId: string;
  defaultExpenseCategoryId: string;
  defaultIncomeCategoryId: string;
  errorMessage: string | null;
  successMessage: string | null;
  isUploading: boolean;
  isSaving: boolean;
  isLoadingLookups: boolean;
  canGeneratePreview: boolean;
  canSaveImport: boolean;
  selectedTransactionCount: number;
  selectFiles: (files: File[]) => void;
  generatePreview: () => void;
  clearPreview: () => void;
  setDefaultAccountId: (accountId: string) => void;
  setDefaultExpenseCategoryId: (categoryId: string) => void;
  setDefaultIncomeCategoryId: (categoryId: string) => void;
  toggleRowSelection: (clientId: string, selected: boolean) => void;
  toggleAllRows: (selected: boolean) => void;
  toggleRowEditing: (clientId: string) => void;
  updateRow: (clientId: string, field: ImportEditableField, value: string) => void;
  saveImport: () => void;
};

export function useImportPreviewWorkspace(): ImportPreviewWorkspace {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const accountsQuery = useQuery(accountQueries.list());
  const categoriesQuery = useQuery(categoryQueries.list());

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<EditableImportPreview | null>(null);
  const [defaultAccountId, setDefaultAccountIdState] = useState('');
  const [defaultExpenseCategoryId, setDefaultExpenseCategoryIdState] = useState('');
  const [defaultIncomeCategoryId, setDefaultIncomeCategoryIdState] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const accounts = accountsQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];
  const expenseCategories = useMemo(
    () => categories.filter((category) => category.type === 'expense'),
    [categories],
  );
  const incomeCategories = useMemo(
    () => categories.filter((category) => category.type === 'income'),
    [categories],
  );

  useEffect(() => {
    if (!defaultAccountId && accounts[0]) {
      setDefaultAccountIdState(accounts[0].id);
    }
  }, [accounts, defaultAccountId]);

  useEffect(() => {
    if (!defaultExpenseCategoryId && expenseCategories[0]) {
      setDefaultExpenseCategoryIdState(expenseCategories[0].id);
    }
  }, [defaultExpenseCategoryId, expenseCategories]);

  useEffect(() => {
    if (!defaultIncomeCategoryId && incomeCategories[0]) {
      setDefaultIncomeCategoryIdState(incomeCategories[0].id);
    }
  }, [defaultIncomeCategoryId, incomeCategories]);

  const previewMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const results = await Promise.all(files.map(async (file): Promise<ImportPreviewResult> => {
        try {
          return {
            fileName: file.name,
            preview: await previewImport(file),
          };
        } catch (error) {
          return {
            fileName: file.name,
            errorMessage: getApiErrorMessage(error, t('imports.previewError')),
          };
        }
      }));

      return combineImportPreviewResults(results);
    },
    onSuccess: (combinedPreview) => {
      if (combinedPreview.successfulFileCount === 0) {
        setPreview(null);
        setErrorMessage(t('imports.previewError'));
        return;
      }

      setPreview(toEditablePreview(combinedPreview, {
        accountId: defaultAccountId,
        expenseCategoryId: defaultExpenseCategoryId,
        incomeCategoryId: defaultIncomeCategoryId,
      }));
      setErrorMessage(null);
      setSuccessMessage(null);
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, t('imports.previewError')));
    },
  });

  const saveMutation = useMutation({
    mutationFn: commitImport,
    onSuccess: (result) => {
      setSelectedFiles([]);
      setPreview(null);
      setErrorMessage(null);
      setSuccessMessage(
        t('imports.saveSuccess')
          .replace('{createdCount}', String(result.createdCount))
          .replace('{skippedDuplicateCount}', String(result.skippedDuplicateCount)),
      );
      void queryClient.invalidateQueries({ queryKey: transactionQueries.all() });
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, t('imports.saveError')));
    },
  });

  useEffect(() => {
    setPreview((currentPreview) => {
      if (!currentPreview) {
        return currentPreview;
      }

      return {
        ...currentPreview,
        transactions: currentPreview.transactions.map((transaction) => ({
          ...transaction,
          accountId: transaction.accountId || defaultAccountId,
          categoryId: transaction.categoryId || categoryForAmount(
            transaction.amount,
            defaultExpenseCategoryId,
            defaultIncomeCategoryId,
          ),
        })),
      };
    });
  }, [defaultAccountId, defaultExpenseCategoryId, defaultIncomeCategoryId]);

  const selectedTransactionCount = preview?.transactions
    .filter((transaction) => transaction.selected)
    .length ?? 0;

  function selectFiles(files: File[]) {
    setSelectedFiles(files.slice(0, 1));
    setPreview(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function generatePreview() {
    if (selectedFiles.length === 0) {
      setErrorMessage(t('imports.validation.fileRequired'));
      return;
    }

    previewMutation.mutate(selectedFiles);
  }

  function clearPreview() {
    setSelectedFiles([]);
    setPreview(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    previewMutation.reset();
    saveMutation.reset();
  }

  function setDefaultAccountId(accountId: string) {
    setDefaultAccountIdState(accountId);
    updateRows((row) => ({ ...row, accountId, error: null }));
  }

  function setDefaultExpenseCategoryId(categoryId: string) {
    setDefaultExpenseCategoryIdState(categoryId);
    updateRows((row) => amountSign(row.amount) < 0 ? { ...row, categoryId, error: null } : row);
  }

  function setDefaultIncomeCategoryId(categoryId: string) {
    setDefaultIncomeCategoryIdState(categoryId);
    updateRows((row) => amountSign(row.amount) > 0 ? { ...row, categoryId, error: null } : row);
  }

  function toggleRowSelection(clientId: string, selected: boolean) {
    updateRows((row) => row.clientId === clientId ? { ...row, selected, error: null } : row);
  }

  function toggleAllRows(selected: boolean) {
    updateRows((row) => isSaveablePreviewRow(row) ? { ...row, selected, error: null } : row);
  }

  function toggleRowEditing(clientId: string) {
    updateRows((row) => row.clientId === clientId ? { ...row, isEditing: !row.isEditing } : row);
  }

  function updateRow(clientId: string, field: ImportEditableField, value: string) {
    updateRows((row) => row.clientId === clientId
      ? {
          ...row,
          [field]: value,
          error: null,
        }
      : row);
  }

  function saveImport() {
    if (!preview) {
      return;
    }

    const rowsToSave = preview.transactions.filter((transaction) => transaction.selected);

    if (rowsToSave.length === 0) {
      setErrorMessage(t('imports.validation.selectionRequired'));
      return;
    }

    const rowsWithErrors = rowsToSave.map((row) => ({
      row,
      error: validateImportRow(row, expenseCategories, incomeCategories, t),
    }));
    const firstError = rowsWithErrors.find((rowWithError) => rowWithError.error);

    if (firstError) {
      setPreview({
        ...preview,
        transactions: preview.transactions.map((transaction) => {
          const rowWithError = rowsWithErrors.find((current) => current.row.clientId === transaction.clientId);

          return rowWithError?.error
            ? { ...transaction, error: rowWithError.error }
            : transaction;
        }),
      });
      setErrorMessage(firstError.error);
      return;
    }

    saveMutation.mutate({
      transactions: rowsToSave.map(toCommitRequest),
    });
  }

  function updateRows(update: (row: ImportPreviewRow) => ImportPreviewRow) {
    setPreview((currentPreview) => currentPreview
      ? {
          ...currentPreview,
          transactions: currentPreview.transactions.map(update),
        }
      : currentPreview);
  }

  return {
    selectedFiles,
    preview,
    accounts,
    expenseCategories,
    incomeCategories,
    defaultAccountId,
    defaultExpenseCategoryId,
    defaultIncomeCategoryId,
    errorMessage,
    successMessage,
    isUploading: previewMutation.isPending,
    isSaving: saveMutation.isPending,
    isLoadingLookups: accountsQuery.isLoading || categoriesQuery.isLoading,
    canGeneratePreview: selectedFiles.length > 0 && !previewMutation.isPending,
    canSaveImport: selectedTransactionCount > 0 && !saveMutation.isPending,
    selectedTransactionCount,
    selectFiles,
    generatePreview,
    clearPreview,
    setDefaultAccountId,
    setDefaultExpenseCategoryId,
    setDefaultIncomeCategoryId,
    toggleRowSelection,
    toggleAllRows,
    toggleRowEditing,
    updateRow,
    saveImport,
  };
}

export function combineImportPreviewResults(results: ImportPreviewResult[]): CombinedImportPreview {
  const successfulResults = results.filter(isSuccessfulPreview);
  const failedResults = results.filter(isFailedPreview);
  const warnings: ImportWarning[] = [];
  const transactions: CombinedPreviewTransaction[] = [];

  for (const result of successfulResults) {
    transactions.push(...result.preview.transactions.map((transaction) => ({
      ...transaction,
      fileName: result.fileName,
    })));
    warnings.push(...result.preview.warnings.map((warning) => ({
      ...warning,
      message: `${result.fileName}: ${warning.message}`,
    })));
  }

  for (const result of failedResults) {
    warnings.push({
      rowNumber: null,
      field: null,
      code: 'file_preview_failed',
      message: `${result.fileName}: ${result.errorMessage}`,
    });
  }

  markCrossFileDuplicates(transactions, warnings);

  const validCount = transactions.filter((transaction) => transaction.status === 'VALID').length;
  const fileCount = results.length;

  return {
    fileName: fileCount === 1 ? results[0].fileName : `${fileCount} files`,
    sourceType: successfulResults[0]?.preview.sourceType ?? 'csv',
    institution: successfulResults[0]?.preview.institution ?? 'inter',
    documentType: successfulResults[0]?.preview.documentType ?? 'BANK_STATEMENT',
    profile: successfulResults[0]?.preview.profile ?? 'UNKNOWN',
    confidence: successfulResults[0]?.preview.confidence ?? 'MEDIUM',
    rowCount: transactions.length,
    validCount,
    warningCount: warnings.length,
    successfulFileCount: successfulResults.length,
    failedFileCount: failedResults.length,
    transactions,
    warnings,
  };
}

function markCrossFileDuplicates(
  transactions: CombinedPreviewTransaction[],
  warnings: ImportWarning[],
) {
  const firstTransactionByHash = new Map<string, CombinedPreviewTransaction>();

  for (let index = 0; index < transactions.length; index++) {
    const transaction = transactions[index];

    if (!transaction.sourceHash || transaction.status !== 'VALID') {
      continue;
    }

    const firstTransaction = firstTransactionByHash.get(transaction.sourceHash);

    if (!firstTransaction) {
      firstTransactionByHash.set(transaction.sourceHash, transaction);
      continue;
    }

    transactions[index] = {
      ...transaction,
      status: 'DUPLICATE',
    };
    warnings.push({
      rowNumber: transaction.rowNumber,
      field: 'sourceHash',
      code: 'duplicate_row',
      message: `${transaction.fileName}: Row duplicates ${firstTransaction.fileName} row ${firstTransaction.rowNumber}.`,
    });
  }
}

function isSuccessfulPreview(result: ImportPreviewResult): result is ImportPreviewSuccess {
  return 'preview' in result;
}

function isFailedPreview(result: ImportPreviewResult): result is ImportPreviewFailure {
  return 'errorMessage' in result;
}

function toEditablePreview(
  preview: CombinedImportPreview,
  defaults: {
    accountId: string;
    expenseCategoryId: string;
    incomeCategoryId: string;
  },
): EditableImportPreview {
  return {
    ...preview,
    transactions: preview.transactions.map((transaction) => ({
      ...transaction,
      clientId: `${transaction.fileName}-${transaction.rowNumber}-${transaction.sourceHash ?? transaction.description}`,
      selected: isSaveablePreviewRow(transaction),
      accountId: defaults.accountId,
      categoryId: categoryForAmount(
        transaction.amount,
        defaults.expenseCategoryId,
        defaults.incomeCategoryId,
      ),
      notes: '',
      error: null,
      isEditing: false,
    })),
  };
}

function isSaveablePreviewRow(transaction: Pick<PreviewTransaction, 'status' | 'transactionDate' | 'amount' | 'description' | 'sourceHash'>) {
  return transaction.status === 'VALID'
    && Boolean(transaction.transactionDate)
    && Boolean(transaction.amount)
    && Boolean(transaction.description.trim())
    && Boolean(transaction.sourceHash);
}

function categoryForAmount(
  amount: string | null,
  expenseCategoryId: string,
  incomeCategoryId: string,
) {
  return amountSign(amount) < 0 ? expenseCategoryId : incomeCategoryId;
}

function amountSign(amount: string | null) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return 0;
  }

  return Math.sign(numericAmount);
}

function validateImportRow(
  row: ImportPreviewRow,
  expenseCategories: Category[],
  incomeCategories: Category[],
  t: (key: TranslationKey) => string,
) {
  if (!isSaveablePreviewRow(row)) {
    return t('imports.validation.rowNotSaveable');
  }
  if (!row.accountId) {
    return t('imports.validation.accountRequired');
  }
  if (!row.categoryId) {
    return t('imports.validation.categoryRequired');
  }

  const sign = amountSign(row.amount);

  if (sign === 0) {
    return t('imports.validation.amountNonZero');
  }
  if (sign < 0 && !expenseCategories.some((category) => category.id === row.categoryId)) {
    return t('imports.validation.expenseCategoryRequired');
  }
  if (sign > 0 && !incomeCategories.some((category) => category.id === row.categoryId)) {
    return t('imports.validation.incomeCategoryRequired');
  }

  return null;
}

function toCommitRequest(row: ImportPreviewRow): ImportCommitItemRequest {
  return {
    transactionDate: row.transactionDate ?? '',
    description: row.description,
    amount: row.amount ?? '',
    accountId: row.accountId,
    categoryId: row.categoryId,
    notes: row.notes.trim() || null,
    sourceType: 'csv',
    institution: 'inter',
    sourceFileName: row.fileName,
    sourceRowNumber: row.rowNumber,
    sourceHash: row.sourceHash ?? '',
  };
}
