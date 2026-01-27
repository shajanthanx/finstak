"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Transaction } from "@/types";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { LayoutGrid, TrendingUp, Calendar } from "lucide-react";

interface DailyExpensesChartProps {
    transactions: Transaction[] | undefined;
}

type TimeRange = 'week' | 'month' | 'year';
type ChartType = 'bar' | 'line';

export function DailyExpensesChart({ transactions }: DailyExpensesChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('month');
    const [chartType, setChartType] = useState<ChartType>('bar');

    const chartData = useMemo(() => {
        if (!transactions) return [];

        const now = new Date();
        const expenseOnly = transactions.filter(t => t.type === 'expense');

        let data: { date: string; amount: number; displayDate: string }[] = [];

        if (timeRange === 'week') {
            // Get start of week (Monday)
            const startOfWeek = new Date(now);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);
            startOfWeek.setHours(0, 0, 0, 0);

            for (let i = 0; i < 7; i++) {
                const date = new Date(startOfWeek);
                date.setDate(startOfWeek.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];

                const amount = expenseOnly
                    .filter(t => t.date === dateStr)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                data.push({
                    date: dateStr,
                    amount,
                    displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                });
            }
        } else if (timeRange === 'month') {
            const year = now.getFullYear();
            const month = now.getMonth();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            for (let i = 1; i <= daysInMonth; i++) {
                const date = new Date(year, month, i);
                const dateStr = date.toISOString().split('T')[0];

                const amount = expenseOnly
                    .filter(t => t.date === dateStr)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                data.push({
                    date: dateStr,
                    amount,
                    displayDate: `${i} ${date.toLocaleDateString('en-US', { month: 'short' })}`
                });
            }
        } else if (timeRange === 'year') {
            const year = now.getFullYear();
            const startDate = new Date(year, 0, 1);
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            const daysInYear = isLeapYear ? 366 : 365;

            for (let i = 0; i < daysInYear; i++) {
                const date = new Date(year, 0, i + 1);
                const dateStr = date.toISOString().split('T')[0];

                const amount = expenseOnly
                    .filter(t => t.date === dateStr)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

                data.push({
                    date: dateStr,
                    amount,
                    displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                });
            }
        }

        return data;
    }, [transactions, timeRange]);

    const chartWidth = useMemo(() => {
        if (timeRange !== 'year') return '100%';
        const pointWidth = 40; // width per data point in px
        const minWidth = 800;
        return `${Math.max(minWidth, chartData.length * pointWidth)}px`;
    }, [chartData, timeRange]);

    return (
        <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                <div>
                    <h3 className="font-semibold text-slate-900">Daily Expenses</h3>
                    <p className="text-sm text-slate-500">
                        {timeRange === 'week' ? 'Expenses for this week' :
                            timeRange === 'month' ? 'Expenses for this month' :
                                'Daily expenses for this year'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Time Range Selector */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setTimeRange('week')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setTimeRange('month')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setTimeRange('year')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${timeRange === 'year' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            This Year
                        </button>
                    </div>

                    {/* Chart Type Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setChartType('bar')}
                            className={`p-1.5 rounded-md transition-all ${chartType === 'bar' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Bar Chart"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setChartType('line')}
                            className={`p-1.5 rounded-md transition-all ${chartType === 'line' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            title="Line Chart"
                        >
                            <TrendingUp className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className={`w-full pb-4 ${timeRange === 'year' ? 'overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent' : ''}`}>
                <div style={{ height: '350px', width: chartWidth, minWidth: '100%' }}>

                    <ResponsiveContainer width="100%" height="100%">
                        {chartType === 'bar' ? (
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="displayDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    angle={-90}
                                    textAnchor="end"
                                    interval={0}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                    formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Expense']}
                                />
                                <Bar dataKey="amount" fill="#18181b" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : (
                            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="displayDate"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    angle={-90}
                                    textAnchor="end"
                                    interval={0}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 11 }}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                    formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Expense']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="amount"
                                    stroke="#18181b"
                                    strokeWidth={2}
                                    dot={{ fill: '#fff', stroke: '#18181b', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#18181b' }}
                                />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </Card>
    );
}

