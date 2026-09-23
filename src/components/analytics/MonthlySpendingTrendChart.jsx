import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import ChartTooltip from './ChartTooltip';
import { getMonthlyTrendData } from '../../utils/chartData';
import { useTheme } from '../../context/ThemeContext';
import { CalendarRange } from 'lucide-react';

export default function MonthlySpendingTrendChart({ transactions = [] }) {
  const { theme } = useTheme();
  const gridColor = theme === 'dark' ? '#1E293B' : '#E2E8F0';
  const axisColor = theme === 'dark' ? '#64748B' : '#94A3B8';

  const data = getMonthlyTrendData(transactions, 6);
  const hasData = data.some((d) => d.Spending > 0);

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Monthly Spending Trend
        </h3>
        <p className="text-[11px] text-slate-400">
          Total expenses per month over the last 6 months
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={CalendarRange}
          title="Not enough monthly history yet"
          description="Keep logging expenses across a few months to see your longer-term spending trend here."
        />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} />
              <Line
                type="monotone"
                dataKey="Spending"
                stroke="#F97316"
                strokeWidth={2.5}
                dot={{ r: 3.5, fill: '#F97316', strokeWidth: 0 }}
                activeDot={{ r: 5.5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
