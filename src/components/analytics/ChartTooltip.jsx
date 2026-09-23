import React from 'react';
import { formatCurrency } from '../../utils/currency';

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-surface-dark-elevated border border-slate-200 dark:border-slate-700 shadow-xl text-xs">
      {label && <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>}
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: entry.color || entry.payload?.color }}
          />
          <span className="text-slate-500 dark:text-slate-400">{entry.name}:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
