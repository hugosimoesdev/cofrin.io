import { Link } from '@tanstack/react-router';
import { Loader2, Plus, Settings } from 'lucide-react';

import { appRoutes } from '@/shared/config';
import { Button } from '@/shared/ui/button';

import type { TransactionWorkspace } from '../model/use-transaction-workspace';

import { TransactionSummary } from './transaction-summary';
import { TransactionsSheet } from './transactions-sheet';

type TransactionWorkspaceViewProps = {
  workspace: TransactionWorkspace;
};

export function TransactionWorkspaceView({ workspace }: TransactionWorkspaceViewProps) {
  const needsSetup = workspace.needsAccount || workspace.needsCategory;

  return (
    <main>
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-8 max-[720px]:px-4">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-normal max-[560px]:text-3xl">
              Transactions
            </h1>
          </div>
          <Button
            type="button"
            onClick={workspace.addDraftRow}
            disabled={!workspace.hasLookups || workspace.hasPendingMutation}
          >
            <Plus />
            Add row
          </Button>
        </header>

        <TransactionSummary summary={workspace.summary} />

        {needsSetup && !workspace.isLoading && !workspace.loadErrorMessage && (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[#172026]/10 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(23,32,38,0.06)]">
            <div>
              <h2 className="text-lg font-semibold">Setup required</h2>
              <p className="mt-1 text-sm text-[#66736f]">
                Create at least one account and one category before adding transactions.
              </p>
            </div>
            <Button type="button" asChild>
              <Link to={appRoutes.configuration}>
                <Settings />
                Open configuration
              </Link>
            </Button>
          </div>
        )}

        {workspace.isLoading && (
          <div className="flex min-h-44 items-center justify-center rounded-lg border border-[#172026]/10 bg-white text-[#66736f]">
            <Loader2 className="mr-2 animate-spin" />
            Loading transactions
          </div>
        )}

        {workspace.loadErrorMessage && (
          <div className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-700">
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
