"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

export function BudgetStatus() {
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
            const percent = (spent / b.limit) * 100;
            return {
                ...b,
                spent,
                percent,
                isOverBudget: spent > b.limit
            };
        });
    }, [transactions, budgets]);

    if (!transactions || !budgets) {
        return <Card className="p-6 h-[300px] animate-pulse bg-slate-50" />;
    }

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Budget Status</h3>
            <div className="space-y-5">
                {categoryStats.slice(0, 3).map((cat, i) => (
                    <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-slate-700">{cat.category}</span>
                            <span className="text-slate-500">${cat.spent.toFixed(0)} / ${cat.limit}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${cat.isOverBudget ? 'bg-rose-500' : 'bg-slate-800'}`}
                                style={{ width: `${Math.min(cat.percent, 100)}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}
