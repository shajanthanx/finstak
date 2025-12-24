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

    if (!transactions || !budgets) {
        return <Card className="col-span-1 p-6 h-[400px] animate-pulse bg-slate-50" />;
    }

    return (
        <Card className="col-span-1 p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Spending by Category</h3>
            <p className="text-sm text-slate-500 mb-6">Where your money went this month</p>
            <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                        <Pie data={categoryStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="spent" stroke="none">
                            {categoryStats.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                    </RechartsPie>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                        <span className="block text-2xl font-bold text-slate-900">
                            ${categoryStats.reduce((acc, curr) => acc + curr.spent, 0).toFixed(0)}
                        </span>
                        <span className="text-xs text-slate-400">Total</span>
                    </div>
                </div>
            </div>
            <div className="mt-6 space-y-3">
                {categoryStats.slice(0, 3).map((cat, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: cat.color }}></span>
                            <span className="text-slate-600">{cat.category}</span>
                        </div>
                        <span className="font-medium text-slate-900">${cat.spent.toFixed(0)}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
