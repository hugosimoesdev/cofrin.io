import { Pencil } from 'lucide-react';

import type { Account } from '@/entities/accounts';
import type { Category } from '@/entities/categories';
import { cn, useI18n, type TranslationKey } from '@/shared/lib';
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
  ImportEditableField,
  ImportPreviewRow,
} from '../model/use-import-preview-workspace';

type ImportPreviewTableProps = {
  transactions: ImportPreviewRow[];
  accounts: Account[];
  expenseCategories: Category[];
  incomeCategories: Category[];
  onToggleRowSelection: (clientId: string, selected: boolean) => void;
  onToggleAllRows: (selected: boolean) => void;
  onToggleRowEditing: (clientId: string) => void;
  onRowChange: (clientId: string, field: ImportEditableField, value: string) => void;
};

const statusClassNames: Record<ImportPreviewRow['status'], string> = {
  VALID: 'bg-primary/10 text-primary',
  INVALID: 'bg-destructive/10 text-destructive',
  DUPLICATE: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
};

const statusLabelKeys: Record<ImportPreviewRow['status'], TranslationKey> = {
  VALID: 'imports.status.valid',
  INVALID: 'imports.status.invalid',
  DUPLICATE: 'imports.status.duplicate',
};

export function ImportPreviewTable({
  transactions,
  accounts,
  expenseCategories,
  incomeCategories,
  onToggleRowSelection,
  onToggleAllRows,
  onToggleRowEditing,
  onRowChange,
}: ImportPreviewTableProps) {
  const { locale, t } = useI18n();
  const selectableRows = transactions.filter(isSaveableRow);
  const allSelectableRowsSelected = selectableRows.length > 0
    && selectableRows.every((transaction) => transaction.selected);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm">
      <Table>
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                checked={allSelectableRowsSelected}
                onChange={(event) => onToggleAllRows(event.target.checked)}
                aria-label={t('imports.selection.toggleAll')}
                className="size-4 rounded border-input"
              />
            </TableHead>
            <TableHead className="min-w-36">{t('imports.columns.date')}</TableHead>
            <TableHead className="min-w-64">{t('imports.columns.description')}</TableHead>
            <TableHead className="min-w-32">{t('imports.columns.amount')}</TableHead>
            <TableHead className="min-w-44">{t('imports.columns.account')}</TableHead>
            <TableHead className="min-w-44">{t('imports.columns.category')}</TableHead>
            <TableHead className="min-w-44">{t('imports.columns.notes')}</TableHead>
            <TableHead className="min-w-32">{t('imports.columns.status')}</TableHead>
            <TableHead className="w-20 text-right">{t('imports.columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                {t('imports.preview.empty')}
              </TableCell>
            </TableRow>
          )}

          {transactions.map((transaction) => (
            <TableRow
              key={`${transaction.fileName}-${transaction.rowNumber}-${transaction.sourceHash ?? transaction.description}`}
              className={cn(transaction.status === 'DUPLICATE' && 'bg-amber-500/10')}
            >
              <TableCell>
                <input
                  type="checkbox"
                  checked={transaction.selected}
                  onChange={(event) =>
                    onToggleRowSelection(transaction.clientId, event.target.checked)
                  }
                  disabled={!isSaveableRow(transaction)}
                  aria-label={t('imports.selection.toggleRow')}
                  className="size-4 rounded border-input"
                />
              </TableCell>
              <TableCell>
                {transaction.isEditing ? (
                  <input
                    type="date"
                    value={transaction.transactionDate ?? ''}
                    onChange={(event) =>
                      onRowChange(transaction.clientId, 'transactionDate', event.target.value)
                    }
                    className={inputClassName}
                  />
                ) : (
                  formatPreviewDate(transaction.transactionDate, locale)
                )}
              </TableCell>
              <TableCell className="max-w-80 whitespace-normal">
                {transaction.isEditing ? (
                  <>
                    <input
                      type="text"
                      value={transaction.description}
                      onChange={(event) =>
                        onRowChange(transaction.clientId, 'description', event.target.value)
                      }
                      className={inputClassName}
                    />
                    {transaction.error && (
                      <p className="mt-1 max-w-56 whitespace-normal text-xs text-destructive">
                        {transaction.error}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {transaction.description || '-'}
                    {transaction.error && (
                      <p className="mt-1 max-w-56 whitespace-normal text-xs text-destructive">
                        {transaction.error}
                      </p>
                    )}
                  </>
                )}
              </TableCell>
              <TableCell>
                {transaction.isEditing ? (
                  <input
                    type="number"
                    step="0.01"
                    value={transaction.amount ?? ''}
                    onChange={(event) =>
                      onRowChange(transaction.clientId, 'amount', event.target.value)
                    }
                    className={inputClassName}
                  />
                ) : (
                  transaction.amount ?? '-'
                )}
              </TableCell>
              <TableCell>
                <select
                  value={transaction.accountId}
                  onChange={(event) =>
                    onRowChange(transaction.clientId, 'accountId', event.target.value)
                  }
                  disabled={!transaction.isEditing}
                  className={inputClassName}
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
                  value={transaction.categoryId}
                  onChange={(event) =>
                    onRowChange(transaction.clientId, 'categoryId', event.target.value)
                  }
                  disabled={!transaction.isEditing}
                  className={inputClassName}
                >
                  {categoriesForAmount(transaction.amount, expenseCategories, incomeCategories).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </TableCell>
              <TableCell>
                {transaction.isEditing ? (
                  <input
                    type="text"
                    value={transaction.notes}
                    onChange={(event) =>
                      onRowChange(transaction.clientId, 'notes', event.target.value)
                    }
                    className={inputClassName}
                  />
                ) : (
                  transaction.notes || '-'
                )}
              </TableCell>
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
              <TableCell>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => onToggleRowEditing(transaction.clientId)}
                    aria-label={t('imports.actions.edit')}
                  >
                    <Pencil />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

const inputClassName = 'h-9 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-80';

function isSaveableRow(transaction: ImportPreviewRow) {
  return transaction.status === 'VALID'
    && Boolean(transaction.transactionDate)
    && Boolean(transaction.amount)
    && Boolean(transaction.description.trim())
    && Boolean(transaction.sourceHash);
}

function categoriesForAmount(
  amount: string | null,
  expenseCategories: Category[],
  incomeCategories: Category[],
) {
  return Number(amount) < 0 ? expenseCategories : incomeCategories;
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
