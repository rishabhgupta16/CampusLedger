import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import ChartTooltip from './ChartTooltip';
import { getIncomeExpenseBarData } from '../../utils/chartData';
import { useTheme } from '../../context/ThemeContext';
import { BarChart3 } from 'lucide-react';

export default function IncomeExpenseBarChart({ transactions = [] }) {
  const { theme } = useTheme();
  const gridColor = theme === 'dark' ? '#1E293B' : '#E2E8F0';
  const axisColor = theme === 'dark' ? '#64748B' : '#94A3B8';

  const data = getIncomeExpenseBarData(transactions);
  const hasData = data.some((d) => d.Income > 0 || d.Expense > 0);

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Income vs Expense (Last 4 Months)
        </h3>
        <p className="text-[11px] text-slate-400">
          Compare your monthly inflow against your spending
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={BarChart3}
          title="Not enough data yet"
          description="Once you have a few months of transactions, this chart will compare income against expenses."
        />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: theme === 'dark' ? 'rgba(148,163,184,0.06)' : 'rgba(100,116,139,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Expense" fill="#F43F5E" radius={[6, 6, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
