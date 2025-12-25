"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/categories";
import { Card } from "@/components/ui/Card";
import { Plus, Check, Loader2, Wallet, X } from "lucide-react";
import { Category } from "@/types";

const ICONS = ["🍔", "🚗", "🎬", "⚡", "🛍️", "🏠", "🏥", "📚", "📄", "📦", "💼", "💻", "📈", "💰", "🎓", "🎁", "✈️", "🏋️", "🎨", "🔧"];
const COLORS = ["#52525b", "#a1a1aa", "#e4e4e7", "#fbbf24", "#8b5cf6", "#18181b", "#ef4444", "#3b82f6", "#10b981", "#6b7280", "#f97316", "#db2777"];

export default function SetupPage() {
    const queryClient = useQueryClient();
    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll,
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState<Partial<Category>>({
        name: "",
        type: "expense",
        icon: "📦",
        color: "#52525b",
        budgetingEnabled: true,
    });

    const createMutation = useMutation({
        mutationFn: categoryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsAdding(false);
            setNewCategory({
                name: "",
                type: "expense",
                icon: "📦",
                color: "#52525b",
                budgetingEnabled: true,
            });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
            categoryService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4">
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Category Management</h1>
                        <p className="text-slate-600">Configure your transaction categories and budgeting preferences.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Category
                    </button>
                </div>

                {isAdding && (
                    <Card className="p-6 border-2 border-slate-200 shadow-sm relative overflow-visible">
                        <button
                            onClick={() => setIsAdding(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-semibold mb-4">New Category</h2>
                        <div className="grid gap-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                        placeholder="e.g. Groceries"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                    <select
                                        value={newCategory.type}
                                        onChange={(e) => setNewCategory({ ...newCategory, type: e.target.value as 'income' | 'expense' })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900 outline-none"
                                    >
                                        <option value="expense">Expense</option>
                                        <option value="income">Income</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                                <div className="flex flex-wrap gap-2">
                                    {ICONS.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setNewCategory({ ...newCategory, icon })}
                                            className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl transition-all ${newCategory.icon === icon
                                                    ? 'bg-slate-900 text-white transform scale-110'
                                                    : 'bg-slate-100 hover:bg-slate-200'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setNewCategory({ ...newCategory, color })}
                                            className={`w-8 h-8 rounded-full transition-all ${newCategory.color === color
                                                    ? 'ring-2 ring-offset-2 ring-slate-900 transform scale-110'
                                                    : 'hover:scale-110'
                                                }`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <div className={`w-12 h-6 rounded-full p-1 transition-colors ${newCategory.budgetingEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                                        }`}>
                                        <div className={`w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform ${newCategory.budgetingEnabled ? 'translate-x-6' : 'translate-x-0'
                                            }`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={newCategory.budgetingEnabled}
                                        onChange={(e) => setNewCategory({ ...newCategory, budgetingEnabled: e.target.checked })}
                                    />
                                    <span className="text-sm font-medium text-slate-700">Include in Budgeting</span>
                                </label>
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => createMutation.mutate(newCategory as Category)}
                                    disabled={!newCategory.name || createMutation.isPending}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Create Category
                                </button>
                            </div>
                        </div>
                    </Card>
                )}

                <div className="grid gap-4">
                    {categories?.map((category: Category) => (
                        <Card key={category.id} className="p-4 flex items-center justify-between group hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: `${category.color}20` }}
                                >
                                    {category.icon}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <span className="capitalize">{category.type}</span>
                                        {category.budgetingEnabled && (
                                            <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                <Wallet className="w-3 h-3" />
                                                Budgeting Enabled
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                    <span className="text-xs font-medium text-slate-500 mr-2">Budgeting</span>
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${category.budgetingEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                                        }`}>
                                        <div className={`w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform ${category.budgetingEnabled ? 'translate-x-4' : 'translate-x-0'
                                            }`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={category.budgetingEnabled}
                                        onChange={(e) => updateMutation.mutate({
                                            id: category.id,
                                            updates: { budgetingEnabled: e.target.checked }
                                        })}
                                    />
                                </label>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
