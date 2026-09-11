import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { previewImport, type ImportPreview } from '@/entities/imports';
import { getApiErrorMessage } from '@/shared/api';
import { useI18n } from '@/shared/lib';

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

export type ImportPreviewWorkspace = {
  selectedFiles: File[];
  preview: CombinedImportPreview | null;
  errorMessage: string | null;
  isUploading: boolean;
  canGeneratePreview: boolean;
  selectFiles: (files: File[]) => void;
  generatePreview: () => void;
  clearPreview: () => void;
};

export function useImportPreviewWorkspace(): ImportPreviewWorkspace {
  const { t } = useI18n();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<CombinedImportPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      setPreview(combinedPreview);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, t('imports.previewError')));
    },
  });

  function selectFiles(files: File[]) {
    setSelectedFiles(files);
    setPreview(null);
    setErrorMessage(null);
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
    previewMutation.reset();
  }

  return {
    selectedFiles,
    preview,
    errorMessage,
    isUploading: previewMutation.isPending,
    canGeneratePreview: selectedFiles.length > 0 && !previewMutation.isPending,
    selectFiles,
    generatePreview,
    clearPreview,
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
