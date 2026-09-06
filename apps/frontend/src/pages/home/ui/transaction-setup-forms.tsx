import type { FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

import { Button } from '@/shared/ui/button';

import type { AccountForm, CategoryForm } from '../model/use-transaction-workspace';

type TransactionSetupFormsProps = {
  needsAccount: boolean;
  needsCategory: boolean;
  accountForm: AccountForm;
  categoryForm: CategoryForm;
  accountFormError: string | null;
  categoryFormError: string | null;
  isCreatingAccount: boolean;
  isCreatingCategory: boolean;
  onAccountFormChange: (field: keyof AccountForm, value: string) => void;
  onCategoryFormChange: (field: keyof CategoryForm, value: string) => void;
  onAccountSubmit: () => void;
  onCategorySubmit: () => void;
};

export function TransactionSetupForms({
  needsAccount,
  needsCategory,
  accountForm,
  categoryForm,
  accountFormError,
  categoryFormError,
  isCreatingAccount,
  isCreatingCategory,
  onAccountFormChange,
  onCategoryFormChange,
  onAccountSubmit,
  onCategorySubmit,
}: TransactionSetupFormsProps) {
  function submitAccountForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAccountSubmit();
  }

  function submitCategoryForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCategorySubmit();
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {needsAccount && (
        <form
          onSubmit={submitAccountForm}
          className="rounded-lg border border-[#172026]/10 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(23,32,38,0.06)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Create account</h2>
            <span className="rounded-md bg-[#eef3ec] px-2 py-1 text-xs font-medium text-[#346657]">
              Required
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
            <label className="grid gap-1 text-sm font-medium text-[#34413d]">
              Name
              <input
                type="text"
                value={accountForm.name}
                onChange={(event) => onAccountFormChange('name', event.target.value)}
                className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-[#34413d]">
              Type
              <select
                value={accountForm.type}
                onChange={(event) => onAccountFormChange('type', event.target.value)}
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
                value={accountForm.initialBalance}
                onChange={(event) => onAccountFormChange('initialBalance', event.target.value)}
                className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </label>
          </div>
          {accountFormError && <p className="mt-3 text-sm text-red-700">{accountFormError}</p>}
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isCreatingAccount}>
              {isCreatingAccount && <Loader2 className="animate-spin" />}
              Create account
            </Button>
          </div>
        </form>
      )}

      {needsCategory && (
        <form
          onSubmit={submitCategoryForm}
          className="rounded-lg border border-[#172026]/10 bg-white px-4 py-4 shadow-[0_10px_28px_rgba(23,32,38,0.06)]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Create category</h2>
            <span className="rounded-md bg-[#eef3ec] px-2 py-1 text-xs font-medium text-[#346657]">
              Required
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <label className="grid gap-1 text-sm font-medium text-[#34413d]">
              Name
              <input
                type="text"
                value={categoryForm.name}
                onChange={(event) => onCategoryFormChange('name', event.target.value)}
                className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-[#34413d]">
              Type
              <select
                value={categoryForm.type}
                onChange={(event) => onCategoryFormChange('type', event.target.value)}
                className="h-9 rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
          </div>
          {categoryFormError && <p className="mt-3 text-sm text-red-700">{categoryFormError}</p>}
          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={isCreatingCategory}>
              {isCreatingCategory && <Loader2 className="animate-spin" />}
              Create category
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
