import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/shared/api';

import { commitImport, previewImport } from './imports-api';

describe('imports api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts a CSV file as multipart form data', async () => {
    const preview = {
      fileName: 'inter.csv',
      sourceType: 'csv',
      institution: 'inter',
      documentType: 'BANK_STATEMENT',
      profile: 'INTER_BANK_STATEMENT',
      confidence: 'MEDIUM',
      rowCount: 0,
      validCount: 0,
      warningCount: 0,
      transactions: [],
      warnings: [],
    };
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: preview });
    const file = new File(['Data,Description,Amount'], 'inter.csv', { type: 'text/csv' });

    await expect(previewImport(file)).resolves.toEqual(preview);

    expect(postSpy).toHaveBeenCalledWith('/api/imports/preview', expect.any(FormData));
    const formData = postSpy.mock.calls[0][1] as FormData;
    expect(formData.get('file')).toBe(file);
  });

  it('commits approved import transactions', async () => {
    const response = {
      requestedCount: 1,
      createdCount: 1,
      skippedDuplicateCount: 0,
      transactions: [],
    };
    const request = {
      transactions: [
        {
          transactionDate: '2026-09-05',
          description: 'Pix recebido',
          amount: '100.00',
          accountId: 'account-1',
          categoryId: 'category-1',
          notes: null,
          sourceType: 'csv',
          institution: 'inter',
          sourceFileName: 'inter.csv',
          sourceRowNumber: 2,
          sourceHash: 'source-hash',
        },
      ],
    };
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: response });

    await expect(commitImport(request)).resolves.toEqual(response);

    expect(postSpy).toHaveBeenCalledWith('/api/imports/commit', request);
  });
});
