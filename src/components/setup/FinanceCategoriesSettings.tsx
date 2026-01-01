"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/categories";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Loader2, Plus, Trash2, Edit2, Search, Filter, Download } from "lucide-react";
import { Category } from "@/types";

const COLORS = [
    { name: "Zinc", value: "#52525b" },
    { name: "Slate", value: "#64748b" },
    { name: "Amber", value: "#fbbf24" },
    { name: "Violet", value: "#8b5cf6" },
    { name: "Black", value: "#18181b" },
    { name: "Red", value: "#ef4444" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Emerald", value: "#10b981" },
    { name: "Orange", value: "#f97316" },
    { name: "Pink", value: "#db2777" },
];

export function FinanceCategoriesSettings() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const { data: categories, isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll,
    });

    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState<Partial<Category>>({
        name: "",
        type: "expense",
        icon: "",
        color: "#52525b",
        budgetingEnabled: true,
    });

    const createMutation = useMutation({
        mutationFn: categoryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
            setIsAdding(false);
            setNewCategory({ name: "", type: "expense", icon: "", color: "#52525b", budgetingEnabled: true });
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
            categoryService.update(id, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: categoryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    const filteredCategories = categories?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center gap-3 py-10">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Loading System</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Finance Categories</h2>
                    <p className="text-sm text-slate-500 mt-1">Configure transaction categories and budget rules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-9 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center">
                        <Download className="w-4 h-4 mr-2 text-slate-500" />
                        Export
                    </button>
                    {!isAdding && (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="h-9 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium shadow-sm flex items-center transition-colors"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </button>
                    )}
                </div>
            </div>

            {/* Filters & Search Toolbar */}
            <div className="flex items-center justify-between gap-4 bg-white p-1 rounded-lg">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <button className="h-10 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg flex items-center border border-transparent hover:border-slate-200 transition-all">
                        <Filter className="w-4 h-4 mr-2 text-slate-400" />
                        Type: All
                    </button>
                </div>
            </div>

            {/* Main Content Table */}
            <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${isAdding ? 'ring-2 ring-indigo-500/20' : ''}`}>

                {/* Creation Panel */}
                {isAdding && (
                    <div className="p-6 bg-slate-50/50 border-b border-indigo-100 flex flex-col gap-4 animate-in slide-in-from-top-2">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                            <div className="col-span-4 space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 ml-1">Name</label>
                                <input
                                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm"
                                    placeholder="e.g. Operations"
                                    value={newCategory.name}
                                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    autoFocus
                                />
                            </div>

                            <div className="col-span-3 space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 ml-1">Type</label>
                                <div className="flex bg-white rounded-lg border border-slate-200 p-1 h-10 shadow-sm">
                                    <button
                                        onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                                        className={`flex-1 rounded-md text-xs font-medium transition-colors ${newCategory.type === 'expense' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Expense
                                    </button>
                                    <button
                                        onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                                        className={`flex-1 rounded-md text-xs font-medium transition-colors ${newCategory.type === 'income' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Income
                                    </button>
                                </div>
                            </div>

                            <div className="col-span-5 space-y-1.5">
                                <label className="text-xs font-semibold text-slate-500 ml-1">Color</label>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1.5 h-10 shadow-sm overflow-x-auto no-scrollbar">
                                    {COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            onClick={() => setNewCategory({ ...newCategory, color: c.value })}
                                            className={`shrink-0 w-6 h-6 rounded-full mx-1 transition-transform ${newCategory.color === c.value ? 'scale-110 ring-2 ring-indigo-400' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                            style={{ backgroundColor: c.value }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <div className="flex items-center gap-2 mr-auto">
                                <Switch
                                    checked={newCategory.budgetingEnabled}
                                    onChange={(e) => setNewCategory({ ...newCategory, budgetingEnabled: e.target.checked })}
                                />
                                <span className="text-sm text-slate-600">Enable Budgeting</span>
                            </div>

                            <button
                                onClick={() => setIsAdding(false)}
                                className="h-9 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => createMutation.mutate(newCategory as Category)}
                                disabled={!newCategory.name || createMutation.isPending}
                                className="h-9 px-6 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50"
                            >
                                {createMutation.isPending ? 'Creating...' : 'Create Category'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Table Header */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-500">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 w-[150px]">Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 w-[150px]">Budget</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-right w-[100px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCategories.length === 0 && !isAdding ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((category) => (
                                    <tr key={category.id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shadow-sm border border-slate-100"
                                                    style={{ backgroundColor: `${category.color}15`, color: category.color }}
                                                >
                                                    {category.icon || category.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{category.name}</span>
                                                    <span className="text-[10px] text-slate-400 font-mono uppercase">{category.color}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${category.type === 'expense'
                                                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                                                    : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                }`}>
                                                {category.type === 'expense' ? 'Expense' : 'Income'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Switch
                                                className="scale-90"
                                                checked={category.budgetingEnabled}
                                                onChange={(e) => updateMutation.mutate({
                                                    id: category.id,
                                                    updates: { budgetingEnabled: e.target.checked }
                                                })}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Decommission this category node?')) {
                                                            deleteMutation.mutate(category.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Footer Mock */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Showing {filteredCategories.length} records</span>
                </div>
            </div>
        </div>
    );
}
