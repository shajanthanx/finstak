"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Percent, DollarSign, Calendar } from "lucide-react";
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
import { useMemo } from "react";

export default function AnalyticsPage() {
    const { data: stats } = useQuery({ queryKey: ['analyticsStats'], queryFn: api.getAnalyticsStats });
    const { data: trendData } = useQuery({ queryKey: ['monthlyTrends'], queryFn: api.getMonthlyTrends });
    const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: api.getTransactions });
    const { data: budgets } = useQuery({ queryKey: ['budgets'], queryFn: api.getBudgets });

    const categoryStats = useMemo(() => {
        if (!transactions || !budgets) return [];

        const spentMap = transactions.reduce((acc, t) => {
            if (t.type === 'expense') {
                acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            }
            return acc;
        }, {} as Record<string, number>);

        return budgets.map(b => {
            const spent = spentMap[b.category] || 0;
            const remaining = b.limit - spent;
            const percent = (spent / b.limit) * 100;
            return {
                ...b,
                spent,
                remaining,
                percent,
                isOverBudget: spent > b.limit
            };
        });
    }, [transactions, budgets]);

    const getIcon = (name: string) => {
        switch (name) {
            case 'Percent': return <Percent className="w-6 h-6 text-emerald-600" />;
            case 'DollarSign': return <DollarSign className="w-6 h-6 text-indigo-600" />;
            case 'Calendar': return <Calendar className="w-6 h-6 text-slate-600" />;
            default: return null;
        }
    };

    const getBgColor = (name: string) => {
        switch (name) {
            case 'Percent': return 'bg-emerald-50';
            case 'DollarSign': return 'bg-indigo-50';
            case 'Calendar': return 'bg-slate-100';
            default: return 'bg-slate-50';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Analytics Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats?.map((stat, i) => (
                    <Card key={i} className="p-6">
                        <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${getBgColor(stat.icon || '')}`}>
                                {getIcon(stat.icon || '')}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                                <p className={`text-xs font-medium ${stat.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {stat.trend}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Comparison Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="col-span-1 lg:col-span-2 p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-semibold text-slate-900">Income vs Expenses</h3>
                            <p className="text-sm text-slate-500">Monthly breakdown for 2023</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center text-xs space-x-1">
                                <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                                <span className="text-slate-600">Income</span>
                            </div>
                            <div className="flex items-center text-xs space-x-1">
                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                <span className="text-slate-600">Expense</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={trendData} barGap={4} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                />
                                <Bar dataKey="income" fill="#18181b" radius={[4, 4, 0, 0]} barSize={20} />
                                <Bar dataKey="expense" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Savings Trend */}
                <Card className="col-span-1 p-6">
                    <h3 className="font-semibold text-slate-900 mb-2">Savings Trend</h3>
                    <p className="text-sm text-slate-500 mb-6">Net savings over last 7 months</p>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                                />
                                <Line type="monotone" dataKey="savings" stroke="#059669" strokeWidth={2} dot={{ fill: '#fff', stroke: '#059669', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, fill: '#059669' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-900">Spending by Category</h3>
                    <p className="text-sm text-slate-500">Detailed breakdown vs. budget</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium text-right">Spent</th>
                                <th className="px-6 py-4 font-medium">Usage</th>
                                <th className="px-6 py-4 font-medium text-right">Remaining</th>
                                <th className="px-6 py-4 font-medium text-right">Limit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {categoryStats.map((cat, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{cat.category}</td>
                                    <td className="px-6 py-4 text-right text-slate-600">${cat.spent.toFixed(2)}</td>
                                    <td className="px-6 py-4 w-1/3">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${cat.isOverBudget ? 'bg-rose-500' : 'bg-slate-800'}`}
                                                    style={{ width: `${Math.min(cat.percent, 100)}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-xs text-slate-400 w-12 text-right">{cat.percent.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`font-medium ${cat.isOverBudget ? 'text-rose-600' : 'text-emerald-600'}`}>
                                            ${cat.remaining.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                                        ${cat.limit}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
