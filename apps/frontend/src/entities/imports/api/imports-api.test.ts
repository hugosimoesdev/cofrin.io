import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from '@/shared/api';

import { previewImport } from './imports-api';

describe('imports api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts a CSV file as multipart form data', async () => {
    const preview = {
      fileName: 'inter.csv',
      sourceType: 'csv',
      institution: 'inter',
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
});
