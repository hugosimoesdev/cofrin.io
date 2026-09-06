import type { FormEvent } from 'react';
import { Check, Loader2, Pencil, Plus, Trash2, X } from 'lucide-react';

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

export function ConfigurationWorkspaceView({ workspace }: ConfigurationWorkspaceViewProps) {
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
            Configuration
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#66736f]">
            Manage transaction accounts and categories.
          </p>
        </header>

        {workspace.isLoading && (
          <div className="flex min-h-44 items-center justify-center rounded-lg border border-[#172026]/10 bg-white text-[#66736f]">
            <Loader2 className="mr-2 animate-spin" />
            Loading configuration
          </div>
        )}

        {workspace.loadErrorMessage && (
          <div className="rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-700">
            {workspace.loadErrorMessage}
          </div>
        )}

        {!workspace.isLoading && !workspace.loadErrorMessage && (
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-lg border border-[#172026]/10 bg-white shadow-[0_18px_42px_rgba(23,32,38,0.08)]">
              <div className="border-b border-[#172026]/10 px-4 py-4">
                <h2 className="text-xl font-semibold">Accounts</h2>
              </div>
              <form onSubmit={submitAccountForm} className="grid gap-3 border-b border-[#172026]/10 px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_130px_130px]">
                  <label className="grid gap-1 text-sm font-medium text-[#34413d]">
                    Name
                    <input
                      type="text"
                      value={workspace.accountForm.name}
                      onChange={(event) => workspace.updateAccountForm('name', event.target.value)}
                      className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-[#34413d]">
                    Type
                    <select
                      value={workspace.accountForm.type}
                      onChange={(event) => workspace.updateAccountForm('type', event.target.value)}
                      className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <option value="cash">Cash</option>
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                      <option value="credit">Credit</option>
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-[#34413d]">
                    Balance
                    <input
                      type="number"
                      step="0.01"
                      value={workspace.accountForm.initialBalance}
                      onChange={(event) =>
                        workspace.updateAccountForm('initialBalance', event.target.value)
                      }
                      className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                  </label>
                </div>
                {workspace.accountFormError && (
                  <p className="text-sm text-red-700">{workspace.accountFormError}</p>
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
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={workspace.hasPendingMutation}>
                    {workspace.isSavingAccount ? <Loader2 className="animate-spin" /> : <Plus />}
                    {workspace.editingAccountId ? 'Save account' : 'Create account'}
                  </Button>
                </div>
              </form>
              {workspace.accountDeleteError && (
                <p className="px-4 pt-4 text-sm text-red-700">{workspace.accountDeleteError}</p>
              )}
              <Table>
                <TableHeader className="bg-[#eef3ec]">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead className="w-40 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.accounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-[#66736f]">
                        No accounts yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {workspace.accounts.map((account) => {
                    const isConfirmingDelete = workspace.confirmingAccountDeleteId === account.id;
                    const isDeleting = workspace.pendingAccountId === account.id;

                    return (
                      <TableRow key={account.id}>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.type}</TableCell>
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
                                  aria-label="Cancel account delete"
                                >
                                  <X />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => workspace.confirmAccountDelete(account.id)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label="Confirm account delete"
                                  title="Deleting an account also deletes related transactions."
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
                                  aria-label="Edit account"
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => workspace.requestAccountDelete(account.id)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label="Delete account"
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

            <section className="rounded-lg border border-[#172026]/10 bg-white shadow-[0_18px_42px_rgba(23,32,38,0.08)]">
              <div className="border-b border-[#172026]/10 px-4 py-4">
                <h2 className="text-xl font-semibold">Categories</h2>
              </div>
              <form onSubmit={submitCategoryForm} className="grid gap-3 border-b border-[#172026]/10 px-4 py-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
                  <label className="grid gap-1 text-sm font-medium text-[#34413d]">
                    Name
                    <input
                      type="text"
                      value={workspace.categoryForm.name}
                      onChange={(event) =>
                        workspace.updateCategoryForm('name', event.target.value)
                      }
                      className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    />
                  </label>
                  <label className="grid gap-1 text-sm font-medium text-[#34413d]">
                    Type
                    <select
                      value={workspace.categoryForm.type}
                      onChange={(event) =>
                        workspace.updateCategoryForm('type', event.target.value)
                      }
                      className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                    >
                      <option value="expense">Expense</option>
                      <option value="income">Income</option>
                    </select>
                  </label>
                </div>
                {workspace.categoryFormError && (
                  <p className="text-sm text-red-700">{workspace.categoryFormError}</p>
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
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={workspace.hasPendingMutation}>
                    {workspace.isSavingCategory ? <Loader2 className="animate-spin" /> : <Plus />}
                    {workspace.editingCategoryId ? 'Save category' : 'Create category'}
                  </Button>
                </div>
              </form>
              {workspace.categoryDeleteError && (
                <p className="px-4 pt-4 text-sm text-red-700">{workspace.categoryDeleteError}</p>
              )}
              <Table>
                <TableHeader className="bg-[#eef3ec]">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-40 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workspace.categories.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-[#66736f]">
                        No categories yet.
                      </TableCell>
                    </TableRow>
                  )}
                  {workspace.categories.map((category) => {
                    const isConfirmingDelete = workspace.confirmingCategoryDeleteId === category.id;
                    const isDeleting = workspace.pendingCategoryId === category.id;

                    return (
                      <TableRow key={category.id}>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.type}</TableCell>
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
                                  aria-label="Cancel category delete"
                                >
                                  <X />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => workspace.confirmCategoryDelete(category.id)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label="Confirm category delete"
                                  title="Deleting a category also deletes related transactions."
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
                                  aria-label="Edit category"
                                >
                                  <Pencil />
                                </Button>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="destructive"
                                  onClick={() => workspace.requestCategoryDelete(category.id)}
                                  disabled={workspace.hasPendingMutation}
                                  aria-label="Delete category"
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
