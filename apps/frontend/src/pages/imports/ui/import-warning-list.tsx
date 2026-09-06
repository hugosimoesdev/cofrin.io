import { AlertTriangle } from 'lucide-react';

import type { ImportWarning } from '@/entities/imports';
import { useI18n } from '@/shared/lib';

type ImportWarningListProps = {
  warnings: ImportWarning[];
};

export function ImportWarningList({ warnings }: ImportWarningListProps) {
  const { t } = useI18n();

  if (warnings.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        {t('imports.warnings.empty')}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4 text-card-foreground shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <AlertTriangle className="size-4 text-destructive" />
        {t('imports.warnings.title')}
      </h2>
      <ul className="mt-3 space-y-2 text-sm">
        {warnings.map((warning, index) => (
          <li key={`${warning.code}-${warning.rowNumber ?? 'global'}-${index}`} className="text-muted-foreground">
            <span className="font-medium text-foreground">
              {warning.rowNumber
                ? t('imports.warnings.row').replace('{rowNumber}', String(warning.rowNumber))
                : t('imports.warnings.file')}
            </span>{' '}
            {warning.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
