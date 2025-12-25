"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { categoryService } from "@/services/categories";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit2, AlertCircle, CheckCircle2, Save } from "lucide-react";
import { useState, useMemo } from "react";
import { Modal } from "@/components/ui/Modal";
import { Budget, Category } from "@/types";
import { getCategoryIcon } from "@/config/categories";

export default function BudgetPage() {
    const queryClient = useQueryClient();
    const [editingCategory, setEditingCategory] = useState<Budget | null>(null);
    const [newLimit, setNewLimit] = useState('');

    const { data: transactions } = useQuery({ queryKey: ['transactions'], queryFn: api.getTransactions });
    const { data: budgets } = useQuery({ queryKey: ['budgets'], queryFn: api.getBudgets });
    const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });

    const updateMutation = useMutation({
        mutationFn: ({ category, limit }: { category: string; limit: number }) =>
            api.updateBudget(category, limit),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgets'] });
            setEditingCategory(null);
            setNewLimit('');
        }
    });

    const categoryStats = useMemo(() => {
        if (!transactions || !budgets || !categories) return [];

        const spentMap = transactions.reduce((acc, t) => {
            if (t.type === 'expense') {
                acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
            }
            return acc;
        }, {} as Record<string, number>);

        // Filter budgets based on budget-enabled categories
        return budgets
            .filter(b => {
                const category = categories.find((c: Category) => c.name === b.category);
                return category ? category.budgetingEnabled : true; // Default to true if category not found (fallback)
            })
            .map(b => {
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
    }, [transactions, budgets, categories]);

    const totalBudget = categoryStats.reduce((acc, curr) => acc + curr.limit, 0);
    const totalSpent = categoryStats.reduce((acc, curr) => acc + curr.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const totalProgress = Math.min((totalSpent / totalBudget) * 100, 100);

    const handleSave = () => {
        if (editingCategory && newLimit) {
            updateMutation.mutate({
                category: editingCategory.category,
                limit: parseFloat(newLimit)
            });
        }
    };

    if (!transactions || !budgets || !categories) return <div className="p-8 animate-pulse">Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Overview Card */}
            <Card className="p-8 bg-white border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-900">Monthly Budget</h2>
                        <p className="text-slate-500">Keep track of your spending limits across categories.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-bold text-slate-900">${totalRemaining.toFixed(2)}</div>
                        <p className="text-slate-500 text-sm">Left to spend</p>
                    </div>
                </div>

                <div className="mt-8 space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-600">Total Spent: ${totalSpent.toFixed(2)}</span>
                        <span className="text-slate-600">Total Budget: ${totalBudget.toFixed(2)}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-slate-900 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${totalProgress}%` }}
                        ></div>
                    </div>
                </div>
            </Card>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {categoryStats.map((cat, i) => (
                    <Card key={i} className="relative overflow-hidden group">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-xl border border-slate-100`}>
                                        {getCategoryIcon(cat.category)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900">{cat.category}</h3>
                                        <p className="text-xs text-slate-500">Monthly Limit</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setEditingCategory(cat); setNewLimit(cat.limit.toString()); }}
                                    className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-slate-900">${cat.spent.toFixed(2)}</span>
                                    <span className="text-xs text-slate-500">of ${cat.limit} budget</span>
                                </div>

                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${cat.isOverBudget ? 'bg-rose-500' : 'bg-slate-800'}`}
                                        style={{ width: `${Math.min(cat.percent, 100)}%` }}
                                    ></div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    {cat.isOverBudget ? (
                                        <span className="flex items-center text-rose-600 font-medium">
                                            <AlertCircle className="w-3 h-3 mr-1" /> Over by ${Math.abs(cat.remaining).toFixed(0)}
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-emerald-600 font-medium">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> On Track
                                        </span>
                                    )}
                                    <span className="text-slate-400">{cat.percent.toFixed(0)}% used</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal
                isOpen={!!editingCategory}
                onClose={() => setEditingCategory(null)}
                title={`Edit ${editingCategory?.category} Budget`}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">New Monthly Limit</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                            <input
                                type="number"
                                className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 font-medium text-slate-900"
                                value={newLimit}
                                onChange={(e) => setNewLimit(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        className="w-full flex items-center justify-center py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98]"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                    </button>
                </div>
            </Modal>
        </div>
    );
}
