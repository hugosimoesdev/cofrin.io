import { Link } from '@tanstack/react-router';
import { Loader2, Plus, Settings } from 'lucide-react';

import { appRoutes } from '@/shared/config';
import { useI18n } from '@/shared/lib';
import { Button } from '@/shared/ui/button';

import type { TransactionWorkspace } from '../model/use-transaction-workspace';

import { TransactionSummary } from './transaction-summary';
import { TransactionsSheet } from './transactions-sheet';

type TransactionWorkspaceViewProps = {
  workspace: TransactionWorkspace;
};

export function TransactionWorkspaceView({ workspace }: TransactionWorkspaceViewProps) {
  const { t } = useI18n();
  const needsSetup = workspace.needsAccount || workspace.needsCategory;

  return (
    <main>
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-8 max-[720px]:px-4">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-normal max-[560px]:text-3xl">
              {t('transactions.title')}
            </h1>
          </div>
          <Button
            type="button"
            onClick={workspace.addDraftRow}
            disabled={!workspace.hasLookups || workspace.hasPendingMutation}
          >
            <Plus />
            {t('transactions.addRow')}
          </Button>
        </header>

        <TransactionSummary summary={workspace.summary} />

        {needsSetup && !workspace.isLoading && !workspace.loadErrorMessage && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-4 text-card-foreground shadow-sm">
            <div>
              <h2 className="text-lg font-semibold">{t('transactions.setupRequired.title')}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('transactions.setupRequired.description')}
              </p>
            </div>
            <Button type="button" asChild>
              <Link to={appRoutes.configuration}>
                <Settings />
                {t('transactions.setupRequired.action')}
              </Link>
            </Button>
          </div>
        )}

        {workspace.isLoading && (
          <div className="flex min-h-44 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
            <Loader2 className="mr-2 animate-spin" />
            {t('transactions.loading')}
          </div>
        )}

        {workspace.loadErrorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
            {workspace.loadErrorMessage}
          </div>
        )}

        {!workspace.isLoading && !workspace.loadErrorMessage && !needsSetup && (
          <TransactionsSheet
            rows={workspace.rows}
            accounts={workspace.accounts}
            categories={workspace.categories}
            pendingSaveClientId={workspace.pendingSaveClientId}
            pendingDeleteClientId={workspace.pendingDeleteClientId}
            hasPendingMutation={workspace.hasPendingMutation}
            onRowChange={workspace.updateRow}
            onSaveRow={workspace.saveRow}
            onRemoveRow={workspace.removeRow}
          />
        )}
      </section>
    </main>
  );
}
