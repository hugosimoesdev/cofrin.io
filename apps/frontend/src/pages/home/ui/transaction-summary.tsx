import type { TransactionSummary as TransactionSummaryModel } from '../model/use-transaction-workspace';

type TransactionSummaryProps = {
  summary: TransactionSummaryModel;
};

export function TransactionSummary({ summary }: TransactionSummaryProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-lg border border-[#172026]/10 bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase text-[#66736f]">Income</p>
        <p className="mt-1 text-2xl font-semibold">${summary.income.toFixed(2)}</p>
      </div>
      <div className="rounded-lg border border-[#172026]/10 bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase text-[#66736f]">Expenses</p>
        <p className="mt-1 text-2xl font-semibold">${Math.abs(summary.expenses).toFixed(2)}</p>
      </div>
      <div className="rounded-lg border border-[#172026]/10 bg-white px-4 py-3">
        <p className="text-xs font-medium uppercase text-[#66736f]">Balance</p>
        <p className="mt-1 text-2xl font-semibold">${summary.balance.toFixed(2)}</p>
      </div>
    </div>
  );
}
