import { apiClient } from '@/shared/api';

export type ImportRowStatus = 'VALID' | 'INVALID' | 'DUPLICATE';

export type PreviewTransaction = {
  transactionDate: string | null;
  description: string;
  amount: string | null;
  rawDescription: string;
  externalId: string | null;
  sourceHash: string | null;
  rowNumber: number;
  status: ImportRowStatus;
};

export type ImportWarning = {
  rowNumber: number | null;
  field: string | null;
  code: string;
  message: string;
};

export type ImportPreview = {
  fileName: string;
  sourceType: string;
  institution: string;
  documentType: string;
  profile: string;
  confidence: string;
  rowCount: number;
  validCount: number;
  warningCount: number;
  transactions: PreviewTransaction[];
  warnings: ImportWarning[];
};

export type ImportCommitItemRequest = {
  transactionDate: string;
  description: string;
  amount: string;
  accountId: string;
  categoryId: string;
  notes: string | null;
  sourceType: string;
  institution: string;
  sourceFileName: string;
  sourceRowNumber: number;
  sourceHash: string;
};

export type ImportCommitRequest = {
  transactions: ImportCommitItemRequest[];
};

export type ImportCommittedTransaction = {
  id: string;
  transactionDate: string;
  description: string;
  amount: number | string;
  accountId: string;
  categoryId: string;
  notes: string | null;
  sourceType: string | null;
  institution: string | null;
  sourceFileName: string | null;
  sourceRowNumber: number | null;
  sourceHash: string | null;
};

export type ImportCommitResponse = {
  requestedCount: number;
  createdCount: number;
  skippedDuplicateCount: number;
  transactions: ImportCommittedTransaction[];
};

export async function previewImport(file: File): Promise<ImportPreview> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ImportPreview>('/api/imports/preview', formData);

  return response.data;
}

export async function commitImport(request: ImportCommitRequest): Promise<ImportCommitResponse> {
  const response = await apiClient.post<ImportCommitResponse>('/api/imports/commit', request);

  return response.data;
}
