"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { categoryService } from "@/services/categories";

export function BudgetStatus() {
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
            .filter(c => c.budgetingEnabled)
            .map(c => {
                const budget = budgets.find(b => b.category === c.name);
                const limit = budget?.limit || 0;
                const spent = spentMap[c.name] || 0;
                const percent = limit > 0 ? (spent / limit) * 100 : 0;

                return {
                    category: c.name,
                    limit,
                    icon: c.icon,
                    color: budget?.color || c.color,
                    spent,
                    percent,
                    isOverBudget: limit > 0 && spent > limit
                };
            })
            .sort((a, b) => b.spent - a.spent); // Priority to highest spending
    }, [transactions, budgets, categories]);

    if (!transactions || !budgets) {
        return <Card className="p-6 h-[300px] animate-pulse bg-slate-50" />;
    }

    return (
        <Card className="p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Budget Status</h3>
            <div className="space-y-5">
                {categoryStats.slice(0, 3).map((cat, i) => (
                    <div key={i} className="group">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <div className="flex items-center">
                                <span className="w-6 h-6 rounded bg-slate-50 flex items-center justify-center mr-2 text-xs border border-slate-100 group-hover:bg-white transition-colors">
                                    {cat.icon || '📦'}
                                </span>
                                <span className="font-semibold text-slate-700">{cat.category}</span>
                            </div>
                            <span className="text-slate-500 font-mono text-xs">${cat.spent.toFixed(0)} <span className="text-slate-300">/</span> ${cat.limit}</span>
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
