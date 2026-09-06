import { Loader2, Plus } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import type { TransactionWorkspace } from '../model/use-transaction-workspace';

import { TransactionSetupForms } from './transaction-setup-forms';
import { TransactionSummary } from './transaction-summary';
import { TransactionsSheet } from './transactions-sheet';

type TransactionWorkspaceViewProps = {
  workspace: TransactionWorkspace;
};

export function TransactionWorkspaceView({ workspace }: TransactionWorkspaceViewProps) {
  return (
    <main className="min-h-svh bg-[#f4f6f0] text-[#172026]">
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-8 max-[720px]:px-4">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase text-[#346657]">cofrin.io</p>
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

        {workspace.showSetup && !workspace.isLoading && !workspace.loadErrorMessage && (
          <TransactionSetupForms
            needsAccount={workspace.needsAccount}
            needsCategory={workspace.needsCategory}
            accountForm={workspace.accountForm}
            categoryForm={workspace.categoryForm}
            accountFormError={workspace.accountFormError}
            categoryFormError={workspace.categoryFormError}
            isCreatingAccount={workspace.isCreatingAccount}
            isCreatingCategory={workspace.isCreatingCategory}
            onAccountFormChange={workspace.updateAccountForm}
            onCategoryFormChange={workspace.updateCategoryForm}
            onAccountSubmit={workspace.submitAccountForm}
            onCategorySubmit={workspace.submitCategoryForm}
          />
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

        {!workspace.isLoading && !workspace.loadErrorMessage && (
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
