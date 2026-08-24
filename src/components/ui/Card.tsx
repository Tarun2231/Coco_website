import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-100 shadow-sm p-5 md:p-6 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
