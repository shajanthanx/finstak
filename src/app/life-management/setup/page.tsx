"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useState } from "react";
import { Plus, Trash2, Edit3, Save, X, Settings as SettingsIcon, Layers } from "lucide-react";
import { TaskCategory } from "@/types";

type SetupSection = 'categories' | 'general';

export default function SetupPage() {
    const [activeSection, setActiveSection] = useState<SetupSection>('categories');

    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-50">
            {/* Setup Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 flex flex-col pt-6">
                <div className="px-6 mb-8">
                    <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-indigo-600" />
                        Setup
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Configure your life management</p>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    <button
                        onClick={() => setActiveSection('categories')}
                        className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'categories'
                                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                    >
                        <Layers className={`w-4 h-4 mr-3 ${activeSection === 'categories' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        Categories
                    </button>
                    {/* Placeholder for future sections */}
                    <button
                        // onClick={() => setActiveSection('general')}
                        className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 cursor-not-allowed opacity-60"
                        title="Coming soon"
                    >
                        <SettingsIcon className="w-4 h-4 mr-3 text-slate-400" />
                        General
                    </button>
                </nav>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-4xl mx-auto">
                    {activeSection === 'categories' && <CategoriesSettings />}
                </div>
            </main>
        </div>
    );
}

function CategoriesSettings() {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [color, setColor] = useState('#6366f1'); // Default Indigo

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
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['taskCategories'] })
    });

    const resetForm = () => {
        setName('');
        setColor('#6366f1');
    };

    const handleStartEdit = (category: TaskCategory) => {
        setEditingId(category.id);
        setName(category.name);
        setColor(category.color || '#6366f1');
        setIsCreating(false);
    };

    const handleSave = () => {
        if (!name.trim()) return;

        if (editingId) {
            updateMutation.mutate({
                id: editingId,
                data: { name, color }
            });
        } else {
            createMutation.mutate({ name, color, icon: '' }); // Icon removed from UI
        }
    };

    const colors = [
        '#ef4444', // Red
        '#f97316', // Orange
        '#f59e0b', // Amber
        '#10b981', // Emerald
        '#06b6d4', // Cyan
        '#3b82f6', // Blue
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#d946ef', // Fuchsia
        '#f43f5e', // Rose
        '#64748b', // Slate
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-200 pb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Task Categories</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage categories to organize your tasks.</p>
                </div>
                {!isCreating && !editingId && (
                    <button
                        onClick={() => { setIsCreating(true); resetForm(); }}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Category
                    </button>
                )}
            </div>

            {/* Create/Edit Form */}
            {(isCreating || editingId) && (
                <div className="bg-white p-6 rounded-xl border border-indigo-200 shadow-sm ring-4 ring-indigo-50/50">
                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-4">
                        {isCreating ? 'New Category' : 'Edit Category'}
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Work, Personal, Gym"
                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-2">Color Label</label>
                            <div className="flex flex-wrap gap-2">
                                {colors.map(c => (
                                    <button
                                        key={c}
                                        onClick={() => setColor(c)}
                                        className={`w-8 h-8 rounded-full transition-transform hover:scale-110 focus:outline-none ring-2 ring-offset-2 ${color === c ? 'ring-slate-400 scale-110' : 'ring-transparent'
                                            }`}
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                            <button
                                onClick={() => { setIsCreating(false); setEditingId(null); }}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!name.trim()}
                                className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                {isCreating ? 'Create Category' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Categories List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-white rounded-xl border border-slate-200 animate-pulse" />
                    ))
                ) : (
                    categories.map(category => (
                        <div
                            key={category.id}
                            className={`group flex items-center justify-between p-5 bg-white rounded-xl border transition-all hover:shadow-md ${editingId === category.id
                                    ? 'border-indigo-500 ring-1 ring-indigo-500'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm"
                                    style={{ backgroundColor: category.color || '#CBD5E1' }}
                                >
                                    {category.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900">{category.name}</h3>
                                    <p className="text-xs text-slate-500">
                                        ID: <span className="font-mono">{category.id.slice(0, 8)}...</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleStartEdit(category)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit3 size={16} />
                                </button>
                                <button
                                    onClick={() => deleteMutation.mutate(category.id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {categories.length === 0 && !isLoading && !isCreating && (
                    <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        <Layers className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No categories found. Create one to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
