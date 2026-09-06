import { Check, Loader2, Trash2, X } from 'lucide-react';

import type { Account } from '@/entities/accounts';
import type { Category } from '@/entities/categories';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';

import type {
  EditableTransactionField,
  TransactionWorkspace,
} from '../model/use-transaction-workspace';
import type { TransactionRow } from '../model/transaction-sheet';

type TransactionsSheetProps = {
  rows: TransactionRow[];
  accounts: Account[];
  categories: Category[];
  pendingSaveClientId: string | null;
  pendingDeleteClientId: string | null;
  hasPendingMutation: boolean;
  onRowChange: (
    clientId: string,
    field: EditableTransactionField,
    value: string,
  ) => void;
  onSaveRow: TransactionWorkspace['saveRow'];
  onRemoveRow: TransactionWorkspace['removeRow'];
};

export function TransactionsSheet({
  rows,
  accounts,
  categories,
  pendingSaveClientId,
  pendingDeleteClientId,
  hasPendingMutation,
  onRowChange,
  onSaveRow,
  onRemoveRow,
}: TransactionsSheetProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#172026]/10 bg-white shadow-[0_18px_42px_rgba(23,32,38,0.08)]">
      <Table>
        <TableHeader className="bg-[#eef3ec]">
          <TableRow>
            <TableHead className="min-w-36">Date</TableHead>
            <TableHead className="min-w-56">Description</TableHead>
            <TableHead className="min-w-36">Amount</TableHead>
            <TableHead className="min-w-44">Account</TableHead>
            <TableHead className="min-w-44">Category</TableHead>
            <TableHead className="min-w-56">Notes</TableHead>
            <TableHead className="w-32 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="h-28 text-center text-[#66736f]">
                No transactions yet.
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => {
            const isSaving = pendingSaveClientId === row.clientId;
            const isDeleting = pendingDeleteClientId === row.clientId;

            return (
              <TableRow key={row.clientId} className={row.error ? 'bg-red-50/70' : undefined}>
                <TableCell>
                  <input
                    type="date"
                    value={row.transactionDate}
                    onChange={(event) =>
                      onRowChange(row.clientId, 'transactionDate', event.target.value)
                    }
                    className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(event) =>
                      onRowChange(row.clientId, 'description', event.target.value)
                    }
                    className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                  {row.error && (
                    <p className="mt-1 max-w-56 whitespace-normal text-xs text-red-700">
                      {row.error}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  <input
                    type="number"
                    step="0.01"
                    value={row.amount}
                    onChange={(event) => onRowChange(row.clientId, 'amount', event.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </TableCell>
                <TableCell>
                  <select
                    value={row.accountId}
                    onChange={(event) => onRowChange(row.clientId, 'accountId', event.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <select
                    value={row.categoryId}
                    onChange={(event) =>
                      onRowChange(row.clientId, 'categoryId', event.target.value)
                    }
                    className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </TableCell>
                <TableCell>
                  <input
                    type="text"
                    value={row.notes}
                    onChange={(event) => onRowChange(row.clientId, 'notes', event.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-white px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={() => onSaveRow(row)}
                      disabled={hasPendingMutation || (!row.isDirty && !row.isDraft)}
                      aria-label="Save transaction"
                    >
                      {isSaving ? <Loader2 className="animate-spin" /> : <Check />}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={row.isDraft ? 'ghost' : 'destructive'}
                      onClick={() => onRemoveRow(row)}
                      disabled={hasPendingMutation}
                      aria-label={row.isDraft ? 'Remove draft row' : 'Delete transaction'}
                    >
                      {isDeleting ? (
                        <Loader2 className="animate-spin" />
                      ) : row.isDraft ? (
                        <X />
                      ) : (
                        <Trash2 />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
