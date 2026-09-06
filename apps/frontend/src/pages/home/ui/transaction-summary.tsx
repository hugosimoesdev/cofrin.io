import type { TransactionSummary as TransactionSummaryModel } from '../model/use-transaction-workspace';
import { useI18n } from '@/shared/lib';

type TransactionSummaryProps = {
  summary: TransactionSummaryModel;
};

export function TransactionSummary({ summary }: TransactionSummaryProps) {
  const { formatCurrency, t } = useI18n();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground">
        <p className="text-xs font-medium uppercase text-muted-foreground">{t('summary.income')}</p>
        <p className="mt-1 text-2xl font-semibold">{formatCurrency(summary.income)}</p>
      </div>
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          {t('summary.expenses')}
        </p>
        <p className="mt-1 text-2xl font-semibold">{formatCurrency(Math.abs(summary.expenses))}</p>
      </div>
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-card-foreground">
        <p className="text-xs font-medium uppercase text-muted-foreground">{t('summary.balance')}</p>
        <p className="mt-1 text-2xl font-semibold">{formatCurrency(summary.balance)}</p>
      </div>
    </div>
  );
}
