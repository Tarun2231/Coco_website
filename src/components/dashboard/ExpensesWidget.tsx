import React from 'react';
import Link from 'next/link';
import { DollarSign, ArrowRight } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Expense } from '@/types';

interface ExpensesWidgetProps {
  expenses: Expense[];
}

export const ExpensesWidget: React.FC<ExpensesWidgetProps> = ({ expenses }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span>Recent Expenses</span>
          </div>
        </div>

        <div className="space-y-4">
          {expenses.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No expenses recorded yet</p>
          ) : (
            expenses.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-800 leading-tight">
                    {item.description}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {formatDate(item.date, 'dd MMM yyyy')}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-slate-900">
                    {formatCurrency(item.amount, item.currency)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/expenses"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
        >
          <span>View all expenses</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
