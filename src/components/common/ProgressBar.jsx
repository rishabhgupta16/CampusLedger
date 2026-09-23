import React from 'react';

export default function ProgressBar({
  value = 0,
  max = 100,
  variant = 'default', // 'default', 'safe', 'warning', 'danger', 'brand'
  size = 'md', // 'sm', 'md', 'lg'
  showLabel = false,
  className = '',
  barClassName = '',
}) {
  const percentage = Math.min(Math.max(0, (value / (max || 1)) * 100), 100);

  const sizeHeights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getVariantColor = () => {
    if (variant === 'safe') return 'bg-emerald-500';
    if (variant === 'warning') return 'bg-amber-500';
    if (variant === 'danger') return 'bg-rose-500';
    if (variant === 'brand') return 'bg-brand-500';
    
    // Auto variant by percentage
    if (percentage > 95) return 'bg-rose-500';
    if (percentage >= 75) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1.5 text-slate-500 dark:text-slate-400 font-medium">
          <span>{percentage.toFixed(0)}% used</span>
          <span>{value} / {max}</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden ${sizeHeights[size] || sizeHeights.md}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getVariantColor()} ${barClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
