'use client';

import React, { useState } from 'react';
import {
  CheckCircle2, RefreshCw, AlertTriangle, Radio, Sparkles,
  UserCheck, ExternalLink, Info, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SourcedEntity } from '@/types';

export type SourceBadgeType =
  | 'VERIFIED_OFFICIAL'
  | 'LAST_UPDATED'
  | 'HISTORICAL_DATA'
  | 'LIVE_DATA'
  | 'SYSTEM_CALCULATED'
  | 'USER_SUBMITTED';

export interface SourceBadgeProps {
  type: SourceBadgeType;
  sourceName?: string;
  sourceUrl?: string;
  publishedDate?: string;
  reportingPeriod?: string;
  lastVerifiedDate?: string;
  customText?: string;
  className?: string;
  size?: 'sm' | 'md';
  showDetails?: boolean;
}

export const SourceBadge: React.FC<SourceBadgeProps> = ({
  type,
  sourceName = 'Ministry of Health Sri Lanka',
  sourceUrl,
  publishedDate,
  reportingPeriod,
  lastVerifiedDate,
  customText,
  className,
  size = 'md',
  showDetails = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const config = {
    VERIFIED_OFFICIAL: {
      label: customText || '✓ VERIFIED OFFICIAL DATA',
      icon: ShieldCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
      dotColor: 'bg-emerald-500',
      description: 'Imported directly from authoritative government health publications.',
    },
    LAST_UPDATED: {
      label: customText || '↻ LAST UPDATED',
      icon: RefreshCw,
      color: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      dotColor: 'bg-blue-500',
      description: 'Timestamp of the most recent data synchronization.',
    },
    HISTORICAL_DATA: {
      label: customText || '⚠ HISTORICAL DATA',
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      dotColor: 'bg-amber-500',
      description: 'Official reported statistics from a past reporting period. Not live bed availability.',
    },
    LIVE_DATA: {
      label: customText || '◉ LIVE DATA',
      icon: Radio,
      color: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
      dotColor: 'bg-purple-500 animate-pulse',
      description: 'Real-time telemetry stream from an authorized automated system.',
    },
    SYSTEM_CALCULATED: {
      label: customText || '✦ SYSTEM CALCULATED',
      icon: Sparkles,
      color: 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
      dotColor: 'bg-sky-500',
      description: 'Derived statistical metric calculated by LankaCare platform using documented algorithm.',
    },
    USER_SUBMITTED: {
      label: customText || 'USER SUBMITTED',
      icon: UserCheck,
      color: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dotColor: 'bg-slate-500',
      description: 'Citizen or field-worker submitted operational report awaiting or under verification.',
    },
  }[type];

  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-[11px] px-2.5 py-1 gap-1.5';

  return (
    <div className="relative inline-flex items-center">
      <div
        className={cn(
          'inline-flex items-center font-bold tracking-tight rounded-md border transition-all select-none shadow-xs',
          config.color,
          sizeClasses,
          showDetails && 'cursor-pointer hover:opacity-90',
          className
        )}
        onClick={() => showDetails && setIsOpen(!isOpen)}
        title={config.description}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
        <span className="truncate">{config.label}</span>
        {showDetails && (
          <Info className="w-3 h-3 ml-0.5 opacity-60 hover:opacity-100 shrink-0" />
        )}
      </div>

      {/* Popover Card for Source Provenance */}
      {isOpen && showDetails && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div
            className="absolute left-0 top-full mt-2 w-72 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in zoom-in-95 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Icon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Source Provenance</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                {type}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              {config.description}
            </p>

            <div className="space-y-1 pt-1 text-[11px]">
              <div>
                <span className="text-slate-400">Source: </span>
                <strong className="text-slate-800 dark:text-slate-100">{sourceName}</strong>
              </div>
              {reportingPeriod && (
                <div>
                  <span className="text-slate-400">Reporting Period: </span>
                  <strong className="text-slate-800 dark:text-slate-100">{reportingPeriod}</strong>
                </div>
              )}
              {publishedDate && (
                <div>
                  <span className="text-slate-400">Published: </span>
                  <span className="text-slate-600 dark:text-slate-300">{publishedDate}</span>
                </div>
              )}
              {lastVerifiedDate && (
                <div>
                  <span className="text-slate-400">Last Verified: </span>
                  <span className="text-slate-600 dark:text-slate-300">{lastVerifiedDate}</span>
                </div>
              )}
            </div>

            {sourceUrl && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:underline"
                >
                  View Official Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
