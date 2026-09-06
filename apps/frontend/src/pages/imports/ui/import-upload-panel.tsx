import { ChangeEvent, useRef } from 'react';
import { FileUp, Loader2, RotateCcw, Upload } from 'lucide-react';

import { useI18n } from '@/shared/lib';
import { Button } from '@/shared/ui/button';

type ImportUploadPanelProps = {
  selectedFile: File | null;
  canGeneratePreview: boolean;
  isUploading: boolean;
  onFileChange: (file: File | null) => void;
  onGeneratePreview: () => void;
  onClearPreview: () => void;
};

export function ImportUploadPanel({
  selectedFile,
  canGeneratePreview,
  isUploading,
  onFileChange,
  onGeneratePreview,
  onClearPreview,
}: ImportUploadPanelProps) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    onFileChange(event.target.files?.[0] ?? null);
  }

  function handleClear() {
    if (inputRef.current) {
      inputRef.current.value = '';
    }

    onClearPreview();
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <section className="rounded-lg border border-border bg-card px-4 py-4 text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-64 flex-1">
          <span className="text-sm font-medium">{t('imports.upload.fileLabel')}</span>
          <div className="mt-2 flex min-h-12 flex-wrap items-center gap-3 rounded-md border border-input bg-background px-3 py-2">
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={openFilePicker}
              disabled={isUploading}
            >
              <FileUp />
              {t('imports.upload.chooseFile')}
            </Button>
            <span className="min-w-0 truncate text-sm text-muted-foreground">
              {selectedFile?.name ?? t('imports.upload.noFile')}
            </span>
          </div>
        </div>

        <Button type="button" onClick={onGeneratePreview} disabled={!canGeneratePreview}>
          {isUploading ? <Loader2 className="animate-spin" /> : <Upload />}
          {t('imports.upload.generatePreview')}
        </Button>

        <Button type="button" variant="secondary" onClick={handleClear} disabled={isUploading}>
          <RotateCcw />
          {t('imports.upload.clear')}
        </Button>
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {selectedFile
          ? t('imports.upload.selectedFile').replace('{fileName}', selectedFile.name)
          : t('imports.upload.noFile')}
      </p>
    </section>
  );
}
