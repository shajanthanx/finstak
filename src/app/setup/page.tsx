"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/categories";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Switch } from "@/components/ui/Switch";
import { Plus, Loader2, Wallet, X, Settings2, Trash2, ArrowRight } from "lucide-react";
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
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-slate-400" />
                    <p className="text-sm font-medium text-slate-500">Loading workspace...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 space-y-12">
            {/* Header Section */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Finance Setup</h1>
                        <p className="text-slate-500 max-w-lg mt-1">
                            Architect your financial framework. Define categories, track flow, and establish budgeting guardrails.
                        </p>
                    </div>
                    {!isAdding && (
                        <Button onClick={() => setIsAdding(true)} className="gap-2">
                            <Plus className="w-4 h-4" />
                            New Category
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Management & Forms */}
                <div className="lg:col-span-4 space-y-8">
                    {isAdding ? (
                        <Card className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/20 relative animate-in fade-in slide-in-from-left-4 duration-300">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                                onClick={() => setIsAdding(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>

                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-6">Create Hierarchy</h2>
                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 ml-1">Category Identity</label>
                                            <Input
                                                placeholder="e.g. Infrastructure, Lifestyle"
                                                value={newCategory.name}
                                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-xs font-semibold text-slate-600 ml-1">Flow Direction</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button
                                                    variant={newCategory.type === 'expense' ? 'default' : 'outline'}
                                                    className="h-9"
                                                    onClick={() => setNewCategory({ ...newCategory, type: 'expense' })}
                                                >
                                                    Expense
                                                </Button>
                                                <Button
                                                    variant={newCategory.type === 'income' ? 'default' : 'outline'}
                                                    className="h-9"
                                                    onClick={() => setNewCategory({ ...newCategory, type: 'income' })}
                                                >
                                                    Income
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Symbol</label>
                                    <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        {ICONS.map((icon) => (
                                            <button
                                                key={icon}
                                                onClick={() => setNewCategory({ ...newCategory, icon })}
                                                className={`w-9 h-9 flex items-center justify-center rounded-md text-lg transition-all ${newCategory.icon === icon
                                                    ? 'bg-white shadow-sm ring-1 ring-slate-200 scale-110'
                                                    : 'hover:bg-white/50'
                                                    }`}
                                            >
                                                {icon}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Theme</label>
                                    <div className="flex flex-wrap gap-2 px-1">
                                        {COLORS.map((color) => (
                                            <button
                                                key={color.value}
                                                onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                                                className={`w-6 h-6 rounded-full border-2 transition-all ${newCategory.color === color.value
                                                    ? 'border-slate-400 scale-125 ring-2 ring-offset-2 ring-slate-100'
                                                    : 'border-transparent hover:scale-110'
                                                    }`}
                                                style={{ backgroundColor: color.value }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-semibold text-slate-900">Budgeting System</p>
                                            <p className="text-[10px] text-slate-500 uppercase tracking-tight">Enable resource tracking</p>
                                        </div>
                                        <Switch
                                            checked={newCategory.budgetingEnabled}
                                            onChange={(e) => setNewCategory({ ...newCategory, budgetingEnabled: e.target.checked })}
                                        />
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-11"
                                    disabled={!newCategory.name || createMutation.isPending}
                                    onClick={() => createMutation.mutate(newCategory as Category)}
                                >
                                    {createMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : (
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                    )}
                                    Deploy Category
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="space-y-6 animate-in fade-in duration-500">
                            <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                                <Settings2 className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 rotate-12" />
                                <h3 className="text-lg font-semibold relative z-10">System Architecture</h3>
                                <p className="text-slate-400 text-sm mt-1 relative z-10">Configure how your workspace handles financial data points.</p>
                                <div className="mt-6 flex items-center gap-4 relative z-10">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{categories?.length || 0}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Total Nodes</p>
                                    </div>
                                    <div className="w-px h-8 bg-slate-800" />
                                    <div className="text-center">
                                        <p className="text-2xl font-bold">{categories?.filter(c => c.budgetingEnabled).length || 0}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Budgeted</p>
                                    </div>
                                </div>
                            </div>

                            <Card className="p-5 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer hover:bg-slate-50/50 transition-colors"
                                onClick={() => setIsAdding(true)}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                    <Plus className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">Add New Category</p>
                                    <p className="text-xs text-slate-500">Expand your tracking schema</p>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Right Column: Category List */}
                <div className="lg:col-span-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Deployed Categories</h2>
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className="font-medium">{categories?.filter(c => c.type === 'income').length} Income</Badge>
                                <Badge variant="outline" className="font-medium">{categories?.filter(c => c.type === 'expense').length} Expense</Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {categories?.map((category: Category) => (
                                <Card
                                    key={category.id}
                                    className="p-4 border-slate-200/60 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/30 transition-all group overflow-hidden"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
                                                style={{ backgroundColor: `${category.color}15`, color: category.color }}
                                            >
                                                {category.icon}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{category.name}</h3>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className={`text-[10px] uppercase font-bold px-1.5 h-4 ${category.type === 'income' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100'}`}
                                                    >
                                                        {category.type}
                                                    </Badge>
                                                    {category.budgetingEnabled && (
                                                        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0 rounded-full border border-emerald-100">
                                                            <Wallet className="w-2.5 h-2.5" />
                                                            LIVE
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform">
                                            <Switch
                                                checked={category.budgetingEnabled}
                                                onChange={(e) => updateMutation.mutate({
                                                    id: category.id,
                                                    updates: { budgetingEnabled: e.target.checked }
                                                })}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500"
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to decommission this category?')) {
                                                        deleteMutation.mutate(category.id);
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {categories?.length === 0 && (
                            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Settings2 className="w-8 h-8 text-slate-200" />
                                </div>
                                <h3 className="text-slate-900 font-semibold">No Infrastructure Detected</h3>
                                <p className="text-slate-500 text-sm mt-1">Start by creating your first tracking category.</p>
                                <Button variant="outline" className="mt-6" onClick={() => setIsAdding(true)}>
                                    Initialize Workspace
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
