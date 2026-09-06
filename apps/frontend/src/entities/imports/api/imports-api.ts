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
  rowCount: number;
  validCount: number;
  warningCount: number;
  transactions: PreviewTransaction[];
  warnings: ImportWarning[];
};

export async function previewImport(file: File): Promise<ImportPreview> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ImportPreview>('/api/imports/preview', formData);

  return response.data;
}
