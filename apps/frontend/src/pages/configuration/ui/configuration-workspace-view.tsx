import type { FormEvent } from 'react';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';

import { useI18n, type TranslationKey } from '@/shared/lib';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

import type { ConfigurationWorkspace } from '../model/use-configuration-workspace';

type ConfigurationWorkspaceViewProps = {
  workspace: ConfigurationWorkspace;
};

const accountTypeLabelKeys: Record<string, TranslationKey> = {
  cash: 'accountType.cash',
  checking: 'accountType.checking',
  savings: 'accountType.savings',
  credit: 'accountType.credit',
};

const categoryTypeLabelKeys: Record<string, TranslationKey> = {
  expense: 'categoryType.expense',
  income: 'categoryType.income',
};

const fieldClassName =
  'h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40';

export function ConfigurationWorkspaceView({ workspace }: ConfigurationWorkspaceViewProps) {
  const { t } = useI18n();

  function submitAccountForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    workspace.submitAccountForm();
  }

  function submitCategoryForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    workspace.submitCategoryForm();
  }

  return (
    <main>
      <section className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-6 py-8 max-[720px]:px-4">
        <header>
          <h1 className="text-4xl font-semibold tracking-normal max-[560px]:text-3xl">
            {t('configuration.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {t('configuration.description')}
          </p>
        </header>

        {workspace.isLoading && (
          <div className="flex min-h-44 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
            <Loader2 className="mr-2 animate-spin" />
            {t('configuration.loading')}
          </div>
        )}

        {workspace.loadErrorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-card px-4 py-3 text-sm text-destructive">
            {workspace.loadErrorMessage}
          </div>
        )}

        {!workspace.isLoading && !workspace.loadErrorMessage && (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
              <div className="border-b border-border px-4 py-4">
                <h2 className="text-xl font-semibold">{t('configuration.accounts.title')}</h2>
              </div>
              <form
                onSubmit={submitAccountForm}
                className="grid gap-3 border-b border-border px-4 py-4"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_130px_130px]">
                  <label className="grid gap-1 text-sm font-medium text-foreground">
                    {t('configuration.form.name')}
                    <input
                      type="text"
                      value={workspace.accountForm.name}
                      onChange={(event) => workspace.updateAccountForm('name', event.target.value)}
                      className={fieldClassName}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-foreground">
                    {t('configuration.form.type')}
                    <select
                      value={workspace.accountForm.type}
                      onChange={(event) => workspace.updateAccountForm('type', event.target.value)}
                      className={fieldClassName}
                    >
                      <option value="cash">{t('accountType.cash')}</option>
                      <option value="checking">{t('accountType.checking')}</option>
                      <option value="savings">{t('accountType.savings')}</option>
                      <option value="credit">{t('accountType.credit')}</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-foreground">
                    {t('configuration.form.balance')}
                    <input
                      type="number"
                      step="0.01"
                      value={workspace.accountForm.initialBalance}
                      onChange={(event) =>
                        workspace.updateAccountForm('initialBalance', event.target.value)
                      }
                      className={fieldClassName}
                    />
                  </label>
                </div>
                {workspace.accountFormError && (
                  <p className="text-sm text-destructive">{workspace.accountFormError}</p>
                )}
                <div className="flex justify-end gap-2">
                  {workspace.editingAccountId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={workspace.cancelAccountEdit}
                      disabled={workspace.hasPendingMutation}
                    >
                      <X />
                      {t('configuration.form.cancel')}
                    </Button>
                  )}
                  <Button type="submit" disabled={workspace.hasPendingMutation}>
                    {workspace.isSavingAccount ? <Loader2 className="animate-spin" /> : <Plus />}
                    {workspace.editingAccountId
                      ? t('configuration.accounts.save')
                      : t('configuration.accounts.create')}
                  </Button>
                </div>
              </form>
              {workspace.accountDeleteError && (
                <p className="px-4 pt-4 text-sm text-destructive">
                  {workspace.accountDeleteError}
                </p>
              )}
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>{t('configuration.form.name')}</TableHead>
                    <TableHead>{t('configuration.form.type')}</TableHead>
                    <TableHead>{t('configuration.form.balance')}</TableHead>
                    <TableHead className="w-40 text-right">
                      {t('transactions.columns.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        {t('configuration.accounts.empty')}
                      </TableCell>
                    </TableRow>
                  )}
                  {workspace.accounts.map((account) => {
                    const isConfirmingDelete = workspace.confirmingAccountDeleteId === account.id;
                    const isDeleting = workspace.pendingAccountId === account.id;

                    return (
                      <TableRow key={account.id}>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>
                          {accountTypeLabelKeys[account.type]
                            ? t(accountTypeLabelKeys[account.type])
                            : account.type}
                        </TableCell>
                        <TableCell>{account.initialBalance}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {isConfirmingDelete ? (
                              <>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  onClick={workspace.cancelAccountDelete}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label={t('configuration.accounts.cancelDelete')}
                                >
                                  <X />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => workspace.confirmAccountDelete(account.id)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label={t('configuration.accounts.confirmDelete')}
                                  title={t('configuration.accounts.deleteWarning')}
                                >
                                  {isDeleting ? <Loader2 className="animate-spin" /> : <Check />}
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  onClick={() => workspace.startAccountEdit(account)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label={t('configuration.accounts.edit')}
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => workspace.requestAccountDelete(account.id)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label={t('configuration.accounts.delete')}
                                >
                                  <Trash2 />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </section>

            <section className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
              <div className="border-b border-border px-4 py-4">
                <h2 className="text-xl font-semibold">{t('configuration.categories.title')}</h2>
              </div>
              <form
                onSubmit={submitCategoryForm}
                className="grid gap-3 border-b border-border px-4 py-4"
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
                  <label className="grid gap-1 text-sm font-medium text-foreground">
                    {t('configuration.form.name')}
                    <input
                      type="text"
                      value={workspace.categoryForm.name}
                      onChange={(event) =>
                        workspace.updateCategoryForm('name', event.target.value)
                      }
                      className={fieldClassName}
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-foreground">
                    {t('configuration.form.type')}
                    <select
                      value={workspace.categoryForm.type}
                      onChange={(event) =>
                        workspace.updateCategoryForm('type', event.target.value)
                      }
                      className={fieldClassName}
                    >
                      <option value="expense">{t('categoryType.expense')}</option>
                      <option value="income">{t('categoryType.income')}</option>
                    </select>
                  </label>
                </div>
                {workspace.categoryFormError && (
                  <p className="text-sm text-destructive">{workspace.categoryFormError}</p>
                )}
                <div className="flex justify-end gap-2">
                  {workspace.editingCategoryId && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={workspace.cancelCategoryEdit}
                      disabled={workspace.hasPendingMutation}
                    >
                      <X />
                      {t('configuration.form.cancel')}
                    </Button>
                  )}
                  <Button type="submit" disabled={workspace.hasPendingMutation}>
                    {workspace.isSavingCategory ? <Loader2 className="animate-spin" /> : <Plus />}
                    {workspace.editingCategoryId
                      ? t('configuration.categories.save')
                      : t('configuration.categories.create')}
                  </Button>
                </div>
              </form>
              {workspace.categoryDeleteError && (
                <p className="px-4 pt-4 text-sm text-destructive">
                  {workspace.categoryDeleteError}
                </p>
              )}
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>{t('configuration.form.name')}</TableHead>
                    <TableHead>{t('configuration.form.type')}</TableHead>
                    <TableHead className="w-40 text-right">
                      {t('transactions.columns.actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                        {t('configuration.categories.empty')}
                      </TableCell>
                    </TableRow>
                  )}
                  {workspace.categories.map((category) => {
                    const isConfirmingDelete = workspace.confirmingCategoryDeleteId === category.id;
                    const isDeleting = workspace.pendingCategoryId === category.id;

                    return (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          {categoryTypeLabelKeys[category.type]
                            ? t(categoryTypeLabelKeys[category.type])
                            : category.type}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            {isConfirmingDelete ? (
                              <>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  onClick={workspace.cancelCategoryDelete}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label={t('configuration.categories.cancelDelete')}
                                >
                                  <X />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => workspace.confirmCategoryDelete(category.id)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label={t('configuration.categories.confirmDelete')}
                                  title={t('configuration.categories.deleteWarning')}
                                >
                                  {isDeleting ? <Loader2 className="animate-spin" /> : <Check />}
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="secondary"
                                  onClick={() => workspace.startCategoryEdit(category)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label={t('configuration.categories.edit')}
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => workspace.requestCategoryDelete(category.id)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label={t('configuration.categories.delete')}
                                >
                                  <Trash2 />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
