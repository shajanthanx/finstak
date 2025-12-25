"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/categories";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";
import { Loader2, Plus, Trash2, ArrowRight } from "lucide-react";
import { Category } from "@/types";

const ICONS = ["🍔", "🚗", "🎬", "⚡", "🛍️", "🏠", "🏥", "📚", "📄", "📦", "💼", "💻", "📈", "💰", "🎓", "🎁", "✈️", "🏋️", "🎨", "🔧"];
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

    const deleteMutation = useMutation({
        mutationFn: categoryService.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Loading System</p>
                </div>
            </div>
        );
    }

    const incomeCategories = categories?.filter(c => c.type === 'income') || [];
    const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

    return (
        <div className="min-h-screen bg-slate-50/50">
            <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 space-y-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Finance Configuration
                        </h1>
                        <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
                            Manage category definitions and system-wide settings.
                            Changes affect categorization and budget tracking immediately.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-6 text-xs text-slate-500 tabular-nums">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                <span>{categories?.length || 0} Total</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span>{categories?.filter(c => c.budgetingEnabled).length || 0} Active</span>
                            </div>
                        </div>
                        <Button
                            onClick={() => setIsAdding(true)}
                            className="h-9 px-4 text-xs font-medium tracking-wide"
                        >
                            Add Category
                        </Button>
                    </div>
                </div>

                {/* Data Grid */}
                <div className="w-full">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-500">
                            <div className="col-span-4 pl-2">Category Name</div>
                            <div className="col-span-2">Type</div>
                            <div className="col-span-4">Configuration</div>
                            <div className="col-span-1 text-right">Budget</div>
                            <div className="col-span-1 text-right pr-2">Actions</div>
                        </div>

                        {/* Table Body */}
                        <div className="divide-y divide-slate-100">
                            {categories?.map((category) => (
                                <div
                                    key={category.id}
                                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors duration-200 group"
                                >
                                    {/* Name & Icon */}
                                    <div className="col-span-4 flex items-center gap-3 pl-2">
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                                            style={{ backgroundColor: `${category.color}10`, color: category.color }}
                                        >
                                            {category.icon}
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">
                                            {category.name}
                                        </span>
                                    </div>

                                    {/* Type */}
                                    <div className="col-span-2 flex items-center">
                                        <Badge
                                            variant="secondary"
                                            className={`font-normal capitalize ${category.type === 'expense'
                                                ? 'bg-slate-100 text-slate-600'
                                                : 'bg-emerald-50 text-emerald-700'
                                                }`}
                                        >
                                            {category.type}
                                        </Badge>
                                    </div>

                                    {/* Configuration */}
                                    <div className="col-span-4 flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                            <div className="w-2 h-2 rounded-full" style={{ background: category.color }} />
                                            <span className="opacity-75">{category.color}</span>
                                        </div>
                                    </div>

                                    {/* Budget Status */}
                                    <div className="col-span-1 flex justify-end">
                                        <Switch
                                            className="scale-90"
                                            checked={category.budgetingEnabled}
                                            onChange={(e) => updateMutation.mutate({
                                                id: category.id,
                                                updates: { budgetingEnabled: e.target.checked }
                                            })}
                                        />
                                    </div>

                                    {/* Actions */}
                                    <div className="col-span-1 flex justify-end pr-2">
                                        <button
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all"
                                            onClick={() => {
                                                if (confirm('Decommission this category node?')) {
                                                    deleteMutation.mutate(category.id);
                                                }
                                            }}
                                            title="Delete Category"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {categories?.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                    <Plus className="w-5 h-5 text-slate-300" />
                                </div>
                                <p className="text-sm font-medium text-slate-900">System Empty</p>
                                <p className="text-xs text-slate-500 mt-1">Initialize your first category node.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Category Modal */}
                <Modal
                    isOpen={isAdding}
                    onClose={() => setIsAdding(false)}
                    title="New Category Node"
                >
                    <div className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">Category Name</label>
                            <Input
                                className="h-9 text-sm focus-visible:ring-1 focus-visible:ring-slate-400"
                                placeholder="e.g. Operations"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">Type</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                                    className={`h-9 text-xs font-medium rounded-md border transition-all ${newCategory.type === 'expense'
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    Expense
                                </button>
                                <button
                                    onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                                    className={`h-9 text-xs font-medium rounded-md border transition-all ${newCategory.type === 'income'
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    Income
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">Iconography</label>
                            <div className="grid grid-cols-5 gap-2 p-2 bg-slate-50 rounded-lg border border-slate-100 max-h-32 overflow-y-auto">
                                {ICONS.map((icon) => (
                                    <button
                                        key={icon}
                                        onClick={() => setNewCategory({ ...newCategory, icon })}
                                        className={`w-9 h-9 flex items-center justify-center text-lg rounded-md transition-all ${newCategory.icon === icon
                                            ? 'bg-white shadow-sm ring-1 ring-slate-200 scale-105'
                                            : 'hover:bg-white/60'
                                            }`}
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-slate-700">Color Tag</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                                        className={`w-6 h-6 rounded-full border-2 transition-all ${newCategory.color === color.value
                                            ? 'border-white ring-2 ring-slate-200 shadow-sm scale-110'
                                            : 'border-transparent hover:scale-110'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between py-2">
                                <div className="space-y-0.5">
                                    <label className="text-xs font-medium text-slate-900">Budget Tracking</label>
                                    <p className="text-[10px] text-slate-400">Include in monthly budget calculations</p>
                                </div>
                                <Switch
                                    checked={newCategory.budgetingEnabled}
                                    onChange={(e) => setNewCategory({ ...newCategory, budgetingEnabled: e.target.checked })}
                                />
                            </div>
                        </div>

                        <Button
                            className="w-full h-10 text-xs font-semibold tracking-wide uppercase mt-2"
                            disabled={!newCategory.name || createMutation.isPending}
                            onClick={() => createMutation.mutate(newCategory as Category)}
                        >
                            {createMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Plus className="w-3 h-3 mr-2" />}
                            Create Node
                        </Button>
                    </div>
                </Modal>
            </div>
        </div>
    );
}
