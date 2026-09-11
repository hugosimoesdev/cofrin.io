import { AlertTriangle } from 'lucide-react';

import { useI18n } from '@/shared/lib';

import type { ImportPreviewWorkspace } from '../model/use-import-preview-workspace';

import { ImportPreviewTable } from './import-preview-table';
import { ImportUploadPanel } from './import-upload-panel';
import { ImportWarningList } from './import-warning-list';

type ImportPreviewWorkspaceViewProps = {
  workspace: ImportPreviewWorkspace;
};

export function ImportPreviewWorkspaceView({ workspace }: ImportPreviewWorkspaceViewProps) {
  const { t } = useI18n();

  return (
    <main>
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-8 max-[720px]:px-4">
        <header>
          <h1 className="text-4xl font-semibold tracking-normal max-[560px]:text-3xl">
            {t('imports.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t('imports.description')}
          </p>
        </header>

        <ImportUploadPanel
          selectedFiles={workspace.selectedFiles}
          canGeneratePreview={workspace.canGeneratePreview}
          isUploading={workspace.isUploading}
          onFileChange={workspace.selectFiles}
          onGeneratePreview={workspace.generatePreview}
          onClearPreview={workspace.clearPreview}
        />

        {workspace.errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            {workspace.errorMessage}
          </div>
        )}

        {workspace.preview && (
          <section className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <PreviewMetric label={t('imports.preview.fileName')} value={workspace.preview.fileName} />
              <PreviewMetric label={t('imports.preview.rowCount')} value={workspace.preview.rowCount} />
              <PreviewMetric label={t('imports.preview.validCount')} value={workspace.preview.validCount} />
              <PreviewMetric
                label={t('imports.preview.warningCount')}
                value={workspace.preview.warningCount}
              />
            </div>

            <ImportWarningList warnings={workspace.preview.warnings} />
            <ImportPreviewTable transactions={workspace.preview.transactions} />
          </section>
        )}
      </section>
    </main>
  );
}

type PreviewMetricProps = {
  label: string;
  value: string | number;
};

function PreviewMetric({ label, value }: PreviewMetricProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground shadow-sm">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-semibold">{value}</p>
    </div>
  );
}
