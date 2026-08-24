import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  colorScheme?: 'green' | 'blue' | 'orange' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  href,
  colorScheme = 'green',
}) => {
  const iconColors = {
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    orange: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  const textColors = {
    green: 'text-emerald-600 hover:text-emerald-700',
    blue: 'text-blue-600 hover:text-blue-700',
    orange: 'text-amber-600 hover:text-amber-700',
    purple: 'text-purple-600 hover:text-purple-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <div className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </div>
          <p className="mt-0.5 text-xs text-slate-500 font-medium">{subtitle}</p>
        </div>

        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center border', iconColors[colorScheme])}>
          {icon}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-50 flex items-center justify-between">
        <Link
          href={href}
          className={cn('text-xs font-bold flex items-center gap-1.5 transition-colors', textColors[colorScheme])}
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
