import type { PreviewTransaction } from '@/entities/imports';
import { cn, useI18n, type TranslationKey } from '@/shared/lib';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

type ImportPreviewTableProps = {
  transactions: PreviewTransaction[];
};

const statusClassNames: Record<PreviewTransaction['status'], string> = {
  VALID: 'bg-primary/10 text-primary',
  INVALID: 'bg-destructive/10 text-destructive',
  DUPLICATE: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

const statusLabelKeys: Record<PreviewTransaction['status'], TranslationKey> = {
  VALID: 'imports.status.valid',
  INVALID: 'imports.status.invalid',
  DUPLICATE: 'imports.status.duplicate',
};

export function ImportPreviewTable({ transactions }: ImportPreviewTableProps) {
  const { locale, t } = useI18n();

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-24">{t('imports.columns.row')}</TableHead>
            <TableHead className="min-w-36">{t('imports.columns.date')}</TableHead>
            <TableHead className="min-w-64">{t('imports.columns.description')}</TableHead>
            <TableHead className="min-w-32">{t('imports.columns.amount')}</TableHead>
            <TableHead className="min-w-36">{t('imports.columns.externalId')}</TableHead>
            <TableHead className="min-w-32">{t('imports.columns.status')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                {t('imports.preview.empty')}
              </TableCell>
            </TableRow>
          )}

          {transactions.map((transaction) => (
            <TableRow
              key={`${transaction.rowNumber}-${transaction.sourceHash ?? transaction.description}`}
              className={cn(transaction.status === 'DUPLICATE' && 'bg-amber-500/10')}
            >
              <TableCell>{transaction.rowNumber}</TableCell>
              <TableCell>{formatPreviewDate(transaction.transactionDate, locale)}</TableCell>
              <TableCell className="max-w-80 whitespace-normal">{transaction.description || '-'}</TableCell>
              <TableCell>{transaction.amount ?? '-'}</TableCell>
              <TableCell>{transaction.externalId ?? '-'}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-flex rounded-md px-2 py-1 text-xs font-medium',
                    statusClassNames[transaction.status],
                  )}
                >
                  {t(statusLabelKeys[transaction.status])}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatPreviewDate(date: string | null, locale: string) {
  if (!date) {
    return '-';
  }

  const [year, month, day] = date.split('-').map(Number);

  if (!year || !month || !day) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: 'short' }).format(
    new Date(year, month - 1, day),
  );
}
