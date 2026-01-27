"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import {
    PieChart as RechartsPie,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { useMemo } from "react";

export function SpendingPieChart() {
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
            return {
                ...b,
                spent,
            };
        });
    }, [transactions, budgets]);

    const { leftLegend, rightLegend } = useMemo(() => {
        const mid = Math.ceil(categoryStats.length / 2);
        return {
            leftLegend: categoryStats.slice(0, mid),
            rightLegend: categoryStats.slice(mid)
        };
    }, [categoryStats]);

    if (!transactions || !budgets) {
        return <Card className="p-6 h-[400px] animate-pulse bg-slate-50" />;
    }

    const totalSpent = categoryStats.reduce((acc, curr) => acc + curr.spent, 0);

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-2 text-center">Spending by Category</h3>
            <p className="text-sm text-slate-500 mb-8 text-center">Where your money went this month</p>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 h-full">
                {/* Left Legend */}
                <div className="flex-1 space-y-4 w-full lg:w-auto order-2 lg:order-1">
                    {leftLegend.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                                    {cat.category}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900 ml-4">
                                ${cat.spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Pie Chart */}
                <div className="relative w-full lg:w-[400px] h-[300px] order-1 lg:order-2 flex shrink-0 justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <RechartsPie>
                            <Pie
                                data={categoryStats}
                                cx="50%"
                                cy="50%"
                                innerRadius={85}
                                outerRadius={115}
                                paddingAngle={5}
                                dataKey="spent"
                                stroke="none"
                            >
                                {categoryStats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                formatter={(value: any) => [`$${Number(value || 0).toLocaleString()}`, 'Spent']}
                            />
                        </RechartsPie>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-slate-900">
                                ${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                </div>

                {/* Right Legend */}
                <div className="flex-1 space-y-4 w-full lg:w-auto order-3">
                    {rightLegend.map((cat, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></div>
                                <span className="text-sm text-slate-600 font-medium group-hover:text-slate-900 transition-colors">
                                    {cat.category}
                                </span>
                            </div>
                            <span className="text-sm font-semibold text-slate-900 ml-4">
                                ${cat.spent.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
}

