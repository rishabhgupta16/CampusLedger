import React from 'react';

export default function Card({
  children,
  className = '',
  subtle3D = false,
  padding = 'p-6',
  onClick,
  ...props
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-surface-dark-card
        border border-slate-200/80 dark:border-slate-800/80
        rounded-2xl
        shadow-card-light dark:shadow-card-dark
        transition-all duration-200
        ${subtle3D ? 'card-3d hover:shadow-card-light-hover dark:hover:shadow-card-dark-hover hover:border-slate-300 dark:hover:border-slate-700' : ''}
        ${isClickable ? 'cursor-pointer' : ''}
        ${padding}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
