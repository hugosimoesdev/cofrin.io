import { describe, expect, it } from 'vitest';

import type { ImportPreview } from '@/entities/imports';

import { combineImportPreviewResults } from './use-import-preview-workspace';

describe('import preview workspace model', () => {
  it('combines successful file previews into one preview', () => {
    const combinedPreview = combineImportPreviewResults([
      { fileName: 'checking.csv', preview: preview('checking.csv', 'hash-1') },
      { fileName: 'credit.csv', preview: preview('credit.csv', 'hash-2') },
    ]);

    expect(combinedPreview).toMatchObject({
      fileName: '2 files',
      rowCount: 2,
      validCount: 2,
      warningCount: 0,
      successfulFileCount: 2,
      failedFileCount: 0,
    });
    expect(combinedPreview.transactions.map((transaction) => transaction.fileName)).toEqual([
      'checking.csv',
      'credit.csv',
    ]);
  });

  it('marks duplicates across files with a warning', () => {
    const combinedPreview = combineImportPreviewResults([
      { fileName: 'first.csv', preview: preview('first.csv', 'same-hash') },
      { fileName: 'second.csv', preview: preview('second.csv', 'same-hash') },
    ]);

    expect(combinedPreview.validCount).toBe(1);
    expect(combinedPreview.warningCount).toBe(1);
    expect(combinedPreview.transactions[0].status).toBe('VALID');
    expect(combinedPreview.transactions[1]).toMatchObject({
      fileName: 'second.csv',
      status: 'DUPLICATE',
    });
    expect(combinedPreview.warnings[0]).toMatchObject({
      rowNumber: 2,
      field: 'sourceHash',
      code: 'duplicate_row',
      message: 'second.csv: Row duplicates first.csv row 2.',
    });
  });

  it('keeps successful previews when another file fails', () => {
    const combinedPreview = combineImportPreviewResults([
      { fileName: 'ok.csv', preview: preview('ok.csv', 'hash-1') },
      { fileName: 'bad.csv', errorMessage: 'Only CSV uploads are supported.' },
    ]);

    expect(combinedPreview).toMatchObject({
      rowCount: 1,
      validCount: 1,
      warningCount: 1,
      successfulFileCount: 1,
      failedFileCount: 1,
    });
    expect(combinedPreview.warnings[0]).toMatchObject({
      rowNumber: null,
      field: null,
      code: 'file_preview_failed',
      message: 'bad.csv: Only CSV uploads are supported.',
    });
  });
});

function preview(fileName: string, sourceHash: string): ImportPreview {
  return {
    fileName,
    sourceType: 'csv',
    institution: 'inter',
    rowCount: 1,
    validCount: 1,
    warningCount: 0,
    transactions: [
      {
        transactionDate: '2026-09-05',
        description: `Transaction from ${fileName}`,
        amount: '10.00',
        rawDescription: `Transaction from ${fileName}`,
        externalId: null,
        sourceHash,
        rowNumber: 2,
        status: 'VALID',
      },
    ],
    warnings: [],
  };
}
