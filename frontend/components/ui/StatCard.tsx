import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositiveGood?: boolean;
    label?: string;
  };
  accentColor?: 'teal' | 'navy' | 'emerald' | 'amber' | 'rose' | 'blue';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  accentColor = 'teal',
  className,
}) => {
  const iconColors = {
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400 border-teal-200/50 dark:border-teal-800/50',
    navy: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-800/50',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/50 dark:border-rose-800/50',
    blue: 'bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border-sky-200/50 dark:border-sky-800/50',
  };

  const isUp = trend ? trend.value > 0 : false;
  const isDown = trend ? trend.value < 0 : false;
  const isGood = trend
    ? trend.isPositiveGood !== false
      ? isUp
      : isDown
    : false;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-sm hover:shadow-md transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
          </p>
        </div>
        {icon && (
          <div
            className={cn(
              'p-2.5 rounded-xl border flex items-center justify-center shrink-0 shadow-xs',
              iconColors[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      {(trend || subtext) && (
        <div className="mt-3.5 flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          {trend && (
            <span
              className={cn(
                'inline-flex items-center gap-1 font-semibold',
                isGood
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {isUp && <TrendingUp className="w-3.5 h-3.5" />}
              {isDown && <TrendingDown className="w-3.5 h-3.5" />}
              {!isUp && !isDown && <Minus className="w-3.5 h-3.5" />}
              <span>{Math.abs(trend.value)}%</span>
            </span>
          )}
          {subtext && (
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {subtext}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
