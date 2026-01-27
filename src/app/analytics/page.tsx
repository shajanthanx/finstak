"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Percent, DollarSign, Calendar, ListChecks } from "lucide-react";
import { categoryService } from "@/services/categories";
import { Category } from "@/types";
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
import { KPIStats } from "@/components/dashboard/KPIStats";
import { SpendingPieChart } from "@/components/dashboard/SpendingPieChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";

import { BudgetStatus } from "@/components/dashboard/BudgetStatus";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { SetupBanner } from "@/components/setup/SetupBanner";
import { DailyExpensesChart } from "@/components/analytics/DailyExpensesChart";


export default function AnalyticsPage() {
    const { data: stats } = useQuery({ queryKey: ['analyticsStats'], queryFn: api.getAnalyticsStats });
    const { data: trendData } = useQuery({ queryKey: ['monthlyTrends'], queryFn: api.getMonthlyTrends });
    const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: api.getTransactions });
    const { data: budgets } = useQuery({ queryKey: ['budgets'], queryFn: api.getBudgets });
    const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });

    const categoryStats = useMemo(() => {
        if (!transactions || !budgets || !categories) return [];

        const spentMap = transactions.reduce((acc, t) => {
            if (t.type === 'expense') {
                acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            }
            return acc;
        }, {} as Record<string, number>);

        return categories
            .map(c => {

                const budget = budgets.find(b => b.category === c.name);
                const limit = budget?.limit || 0;
                const spent = spentMap[c.name] || 0;
                const remaining = limit - spent;
                const percent = limit > 0 ? (spent / limit) * 100 : 0;

                return {
                    category: c.name,
                    limit,
                    icon: c.icon,
                    color: budget?.color || c.color,
                    spent,
                    remaining,
                    percent,
                    isOverBudget: limit > 0 && spent > limit
                };
            });
    }, [transactions, budgets, categories]);

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
            <SetupBanner />
            {/* KPI Stats from Home */}
            <KPIStats />
            <DailyExpensesChart transactions={transactions} />


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
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-lg group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                                                {cat.icon || '📦'}
                                            </div>
                                            <span className="font-medium text-slate-900">{cat.category}</span>
                                        </div>
                                    </td>
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

            {/* Dashboard Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3">
                    <SpendingPieChart />
                </div>
            </div>



            {/* Dashboard Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecentTransactions />
                <div className="space-y-6">
                    <BudgetStatus />
                    <UpcomingBills />
                </div>
            </div>
        </div>
    );
}
