import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight, Bell } from 'lucide-react';
import { formatDate, getCountdownString } from '@/lib/utils';
import { Reminder } from '@/types';

interface RemindersWidgetProps {
  reminders: Reminder[];
}

export const RemindersWidget: React.FC<RemindersWidgetProps> = ({ reminders }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
            <Bell className="w-5 h-5 text-amber-500" />
            <span>Upcoming Reminders</span>
          </div>
        </div>

        <div className="space-y-4">
          {reminders.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No upcoming reminders</p>
          ) : (
            reminders.slice(0, 3).map((item) => {
              const countdown = getCountdownString(item.date);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        {formatDate(item.date, 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border ${
                      countdown.isOverdue
                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                        : 'bg-amber-100/70 text-amber-800 border-amber-200/80'
                    }`}
                  >
                    {countdown.text}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-100">
        <Link
          href="/dashboard/reminders"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
        >
          <span>View all reminders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
