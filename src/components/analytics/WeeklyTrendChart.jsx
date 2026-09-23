import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import ChartTooltip from './ChartTooltip';
import { getWeeklyTrendData } from '../../utils/chartData';
import { useTheme } from '../../context/ThemeContext';
import { TrendingUp } from 'lucide-react';

export default function WeeklyTrendChart({ transactions = [] }) {
  const { theme } = useTheme();
  const gridColor = theme === 'dark' ? '#1E293B' : '#E2E8F0';
  const axisColor = theme === 'dark' ? '#64748B' : '#94A3B8';

  const data = getWeeklyTrendData(transactions);
  const hasData = data.some((d) => d.Spending > 0);

  return (
    <Card subtle3D padding="p-5 sm:p-6" className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Weekly Spending Trend
        </h3>
        <p className="text-[11px] text-slate-400">
          Your daily spending over the last 7 days
        </p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={TrendingUp}
          title="No recent spending"
          description="Log a few expenses this week to see your daily spending trend."
        />
      ) : (
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke={axisColor} fontSize={11} tickLine={false} axisLine={false} width={40} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="Spending"
                stroke="#6366F1"
                strokeWidth={2.5}
                fill="url(#spendGradient)"
                dot={{ r: 3, fill: '#6366F1', strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
