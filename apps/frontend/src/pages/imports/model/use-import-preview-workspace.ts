import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import { previewImport, type ImportPreview } from '@/entities/imports';
import { getApiErrorMessage } from '@/shared/api';
import { useI18n } from '@/shared/lib';

export type ImportPreviewWorkspace = {
  selectedFile: File | null;
  preview: ImportPreview | null;
  errorMessage: string | null;
  isUploading: boolean;
  canGeneratePreview: boolean;
  selectFile: (file: File | null) => void;
  generatePreview: () => void;
  clearPreview: () => void;
};

export function useImportPreviewWorkspace(): ImportPreviewWorkspace {
  const { t } = useI18n();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewMutation = useMutation({
    mutationFn: previewImport,
    onSuccess: (importPreview) => {
      setPreview(importPreview);
      setErrorMessage(null);
    },
    onError: (error) => {
      setErrorMessage(getApiErrorMessage(error, t('imports.previewError')));
    },
  });

  function selectFile(file: File | null) {
    setSelectedFile(file);
    setPreview(null);
    setErrorMessage(null);
  }

  function generatePreview() {
    if (!selectedFile) {
      setErrorMessage(t('imports.validation.fileRequired'));
      return;
    }

    previewMutation.mutate(selectedFile);
  }

  function clearPreview() {
    setSelectedFile(null);
    setPreview(null);
    setErrorMessage(null);
    previewMutation.reset();
  }

  return {
    selectedFile,
    preview,
    errorMessage,
    isUploading: previewMutation.isPending,
    canGeneratePreview: selectedFile !== null && !previewMutation.isPending,
    selectFile,
    generatePreview,
    clearPreview,
  };
}
