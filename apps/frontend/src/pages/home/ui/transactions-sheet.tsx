import { Check, Loader2, Trash2, X } from 'lucide-react';

import type { Account } from '@/entities/accounts';
import type { Category } from '@/entities/categories';
import { cn, useI18n } from '@/shared/lib';
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
  pendingBulkDeleteClientIds: string[];
  hasPendingMutation: boolean;
  selectedClientIds: string[];
  selectedRowCount: number;
  isConfirmingBulkDelete: boolean;
  bulkDeleteErrorMessage: string | null;
  onRowChange: (
    clientId: string,
    field: EditableTransactionField,
    value: string,
  ) => void;
  onSaveRow: TransactionWorkspace['saveRow'];
  onRemoveRow: TransactionWorkspace['removeRow'];
  onToggleRowSelection: TransactionWorkspace['toggleRowSelection'];
  onToggleAllRows: TransactionWorkspace['toggleAllRows'];
  onRequestBulkDelete: TransactionWorkspace['requestBulkDelete'];
  onCancelBulkDelete: TransactionWorkspace['cancelBulkDelete'];
  onConfirmBulkDelete: TransactionWorkspace['confirmBulkDelete'];
};

export function TransactionsSheet({
  rows,
  accounts,
  categories,
  pendingSaveClientId,
  pendingDeleteClientId,
  pendingBulkDeleteClientIds,
  hasPendingMutation,
  selectedClientIds,
  selectedRowCount,
  isConfirmingBulkDelete,
  bulkDeleteErrorMessage,
  onRowChange,
  onSaveRow,
  onRemoveRow,
  onToggleRowSelection,
  onToggleAllRows,
  onRequestBulkDelete,
  onCancelBulkDelete,
  onConfirmBulkDelete,
}: TransactionsSheetProps) {
  const { t } = useI18n();
  const selectedClientIdSet = new Set(selectedClientIds);
  const allRowsSelected = rows.length > 0
    && rows.every((row) => selectedClientIdSet.has(row.clientId));
  const isBulkDeleting = pendingBulkDeleteClientIds.length > 0;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      {selectedRowCount > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium">
              {t('transactions.selection.summary').replace('{count}', String(selectedRowCount))}
            </p>
            {bulkDeleteErrorMessage && (
              <p className="mt-1 text-xs text-destructive">{bulkDeleteErrorMessage}</p>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {isConfirmingBulkDelete ? (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancelBulkDelete}
                  disabled={hasPendingMutation}
                >
                  <X />
                  {t('transactions.selection.cancelDelete')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={onConfirmBulkDelete}
                  disabled={hasPendingMutation}
                  title={t('transactions.selection.deleteWarning')}
                >
                  {isBulkDeleting ? <Loader2 className="animate-spin" /> : <Check />}
                  {t('transactions.selection.confirmDelete')}
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={onRequestBulkDelete}
                disabled={hasPendingMutation}
              >
                <Trash2 />
                {t('transactions.selection.deleteSelected')}
              </Button>
            )}
          </div>
        </div>
      )}
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={allRowsSelected}
                onChange={(event) => onToggleAllRows(event.target.checked)}
                disabled={rows.length === 0 || hasPendingMutation}
                aria-label={t('transactions.selection.toggleAll')}
                className="size-4 rounded border-input"
              />
            </TableHead>
            <TableHead className="min-w-36">{t('transactions.columns.date')}</TableHead>
            <TableHead className="min-w-56">{t('transactions.columns.description')}</TableHead>
            <TableHead className="min-w-36">{t('transactions.columns.amount')}</TableHead>
            <TableHead className="min-w-44">{t('transactions.columns.account')}</TableHead>
            <TableHead className="min-w-44">{t('transactions.columns.category')}</TableHead>
            <TableHead className="min-w-56">{t('transactions.columns.notes')}</TableHead>
            <TableHead className="w-32 text-right">{t('transactions.columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-28 text-center text-muted-foreground">
                {t('transactions.empty')}
              </TableCell>
            </TableRow>
          )}

          {rows.map((row) => {
            const isSaving = pendingSaveClientId === row.clientId;
            const isDeleting = pendingDeleteClientId === row.clientId
              || pendingBulkDeleteClientIds.includes(row.clientId);
            const isSelected = selectedClientIdSet.has(row.clientId);

            return (
              <TableRow
                key={row.clientId}
                data-state={isSelected ? 'selected' : undefined}
                className={cn(row.error && 'bg-destructive/10')}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(event) =>
                      onToggleRowSelection(row.clientId, event.target.checked)
                    }
                    disabled={hasPendingMutation}
                    aria-label={t('transactions.selection.toggleRow')}
                    className="size-4 rounded border-input"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="date"
                    value={row.transactionDate}
                    onChange={(event) =>
                      onRowChange(row.clientId, 'transactionDate', event.target.value)
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(event) =>
                      onRowChange(row.clientId, 'description', event.target.value)
                    }
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                  {row.error && (
                    <p className="mt-1 max-w-56 whitespace-normal text-xs text-destructive">
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
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  />
                </TableCell>
                <TableCell>
                  <select
                    value={row.accountId}
                    onChange={(event) => onRowChange(row.clientId, 'accountId', event.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                    className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
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
                      aria-label={t('transactions.actions.save')}
                    >
                      {isSaving ? <Loader2 className="animate-spin" /> : <Check />}
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant={row.isDraft ? 'ghost' : 'destructive'}
                      onClick={() => onRemoveRow(row)}
                      disabled={hasPendingMutation}
                      aria-label={
                        row.isDraft
                          ? t('transactions.actions.removeDraft')
                          : t('transactions.actions.delete')
                      }
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
