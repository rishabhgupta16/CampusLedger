import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import ChartTooltip from './ChartTooltip';
import { getCategoryPieData } from '../../utils/chartData';
import { formatCurrency } from '../../utils/currency';
import { PieChart as PieIcon } from 'lucide-react';

export default function CategoryPieChart({ transactions = [] }) {
  const data = getCategoryPieData(transactions);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Expense Breakdown by Category
        </h3>
        <p className="text-[11px] text-slate-400">
          All-time distribution across canteen, travel, gym, and more
        </p>
      </div>

      {data.length === 0 ? (
        <EmptyState
          icon={PieIcon}
          title="No expense data yet"
          description="Add a few expenses to see your category breakdown here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="58%"
                  outerRadius="85%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {data.map((entry) => {
              const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              return (
                <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{entry.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(entry.value)}</span>
                    <span className="text-slate-400 w-9 text-right">{percent}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
