"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useState } from "react";
import { Plus, Trash2, Edit2, Search, MoreHorizontal, Filter, Download } from "lucide-react";
import { TaskCategory } from "@/types";

export function TaskCategoriesSettings() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [color, setColor] = useState('#6366f1');

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['taskCategories'],
        queryFn: api.getTaskCategories
    });

    const createMutation = useMutation({
        mutationFn: api.createTaskCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskCategories'] });
            setIsCreating(false);
            resetForm();
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<TaskCategory> }) =>
            api.updateTaskCategory(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskCategories'] });
            setEditingId(null);
            resetForm();
        }
    });

    const deleteMutation = useMutation({
        mutationFn: api.deleteTaskCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['taskCategories'] });
        },
        onError: (error: any) => {
            console.error("Failed to delete category:", error);
            // Assuming the API returns a JSON with an error message in 'error' field
            const msg = error?.response?.data?.error || error?.message || "Could not delete category. It might be in use by active tasks.";
            alert(msg);
        }
    });

    const resetForm = () => {
        setName('');
        setColor('#6366f1');
    };

    const handleSave = () => {
        if (!name.trim()) return;
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: { name, color } });
        } else {
            createMutation.mutate({ name, color, icon: '' });
        }
    };

    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
        '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'
    ];

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-semibold text-slate-900">Task Categories</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage and organize your task groups.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-9 px-3 bg-white border border-slate-200 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm flex items-center">
                        <Download className="w-4 h-4 mr-2 text-slate-500" />
                        Export
                    </button>
                    {!isCreating && (
                        <button
                            onClick={() => { setIsCreating(true); resetForm(); }}
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
                {/* Optional additional filters */}
                <div className="hidden sm:flex items-center gap-2">
                    <button className="h-10 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg flex items-center border border-transparent hover:border-slate-200 transition-all">
                        <Filter className="w-4 h-4 mr-2 text-slate-400" />
                        Status: Active
                    </button>
                </div>
            </div>

            {/* Main Content Table (Card Style) */}
            <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${isCreating ? 'ring-2 ring-indigo-500/20' : ''}`}>

                {/* Creation Form Panel - Collapsible */}
                {isCreating && (
                    <div className="p-6 bg-slate-50/50 border-b border-indigo-100 flex flex-col sm:flex-row items-end gap-4 animate-in slide-in-from-top-2">
                        <div className="flex-1 w-full space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 ml-1">Category Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Marketing Projects"
                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm shadow-sm"
                                autoFocus
                            />
                        </div>
                        <div className="w-full sm:w-auto space-y-1.5">
                            <label className="text-xs font-semibold text-slate-500 ml-1">Color Label</label>
                            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1.5 h-10 shadow-sm">
                                {colors.slice(0, 5).map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-6 h-6 rounded-full mx-0.5 transition-transform ${color === c ? 'scale-110 ring-2 ring-indigo-400' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pb-0.5">
                            <button
                                onClick={handleSave}
                                disabled={!name}
                                className="h-10 px-6 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create
                            </button>
                            <button
                                onClick={() => setIsCreating(false)}
                                className="h-10 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 shadow-sm"
                            >
                                Cancel
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
                                <th className="px-6 py-4 font-semibold text-slate-500 w-[150px]">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 w-[150px]">Created</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 text-right w-[100px]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-16 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 rounded"></div></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length === 0 && !isCreating ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 bg-slate-50/30">
                                        No categories found. Start by creating one.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map(category => (
                                    <tr key={category.id} className="group hover:bg-slate-50/80 transition-colors">
                                        <td className="px-6 py-4">
                                            {editingId === category.id ? (
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full max-w-[200px] h-8 px-2 text-sm border border-slate-200 rounded focus:border-indigo-500 focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                                                />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: category.color || '#cbd5e1' }} />
                                                    <span className="font-medium text-slate-900">{category.name}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100/50">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                Active
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-xs tabular-nums">
                                            Oct 24, 2024
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            {editingId === category.id ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={handleSave} className="text-indigo-600 text-xs font-medium hover:underline">Save</button>
                                                    <button onClick={() => { setEditingId(null); resetForm(); }} className="text-slate-500 text-xs font-medium hover:underline">Cancel</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(category.id);
                                                            setName(category.name);
                                                            setColor(category.color || '#6366f1');
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm('Are you sure you want to delete this category? By deleting this, tasks assigned to this category might lose their assignment.')) {
                                                                deleteMutation.mutate(category.id);
                                                            }
                                                        }}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded bg-white border border-transparent hover:border-rose-100 transition-all shadow-sm"
                                                        title="Delete Category"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Footer Mock */}
                <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Showing {filteredCategories.length} categories</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 text-xs border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                        <button className="px-3 py-1 text-xs border border-slate-200 rounded bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
