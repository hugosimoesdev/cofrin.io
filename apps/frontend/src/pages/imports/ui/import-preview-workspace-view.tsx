import { AlertTriangle, Loader2, Save } from 'lucide-react';

import { useI18n } from '@/shared/lib';
import { Button } from '@/shared/ui/button';

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
      <section className="app-container flex flex-col gap-6 py-8">
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

        {workspace.successMessage && (
          <div className="rounded-lg border border-primary/30 bg-card px-4 py-3 text-sm text-primary">
            {workspace.successMessage}
          </div>
        )}

        {workspace.preview && (
          <section className="flex flex-col gap-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <PreviewMetric label={t('imports.preview.fileName')} value={workspace.preview.fileName} />
              <PreviewMetric
                label={t('imports.preview.documentType')}
                value={documentTypeLabel(workspace.preview.documentType, t)}
              />
              <PreviewMetric label={t('imports.preview.rowCount')} value={workspace.preview.rowCount} />
              <PreviewMetric label={t('imports.preview.validCount')} value={workspace.preview.validCount} />
              <PreviewMetric
                label={t('imports.preview.warningCount')}
                value={workspace.preview.warningCount}
              />
            </div>

            <ImportWarningList warnings={workspace.preview.warnings} />
            <ImportDefaultsPanel workspace={workspace} />
            <ImportPreviewTable
              transactions={workspace.preview.transactions}
              accounts={workspace.accounts}
              expenseCategories={workspace.expenseCategories}
              incomeCategories={workspace.incomeCategories}
              onToggleRowSelection={workspace.toggleRowSelection}
              onToggleAllRows={workspace.toggleAllRows}
              onToggleRowEditing={workspace.toggleRowEditing}
              onRowChange={workspace.updateRow}
            />
          </section>
        )}
      </section>
    </main>
  );
}

function documentTypeLabel(documentType: string, t: ReturnType<typeof useI18n>['t']) {
  if (documentType === 'CREDIT_CARD_STATEMENT') {
    return t('imports.documentType.creditCardStatement');
  }

  if (documentType === 'BANK_STATEMENT') {
    return t('imports.documentType.bankStatement');
  }

  return t('imports.documentType.unknown');
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

function ImportDefaultsPanel({ workspace }: ImportPreviewWorkspaceViewProps) {
  const { t } = useI18n();

  return (
    <section className="rounded-lg border border-border bg-card px-4 py-4 text-card-foreground shadow-sm">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm font-medium">
          {t('imports.defaults.account')}
          <select
            value={workspace.defaultAccountId}
            onChange={(event) => workspace.setDefaultAccountId(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {workspace.accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          {t('imports.defaults.expenseCategory')}
          <select
            value={workspace.defaultExpenseCategoryId}
            onChange={(event) => workspace.setDefaultExpenseCategoryId(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {workspace.expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          {t('imports.defaults.incomeCategory')}
          <select
            value={workspace.defaultIncomeCategoryId}
            onChange={(event) => workspace.setDefaultIncomeCategoryId(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            {workspace.incomeCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t('imports.selection.summary').replace('{count}', String(workspace.selectedTransactionCount))}
        </p>
        <Button
          type="button"
          onClick={workspace.saveImport}
          disabled={!workspace.canSaveImport}
        >
          {workspace.isSaving ? <Loader2 className="animate-spin" /> : <Save />}
          {t('imports.actions.save')}
        </Button>
      </div>
    </section>
  );
}
