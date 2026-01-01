"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Layers, ListTodo } from "lucide-react";

interface TaskCategorySidebarProps {
    selectedCategoryId: string | null;
    onSelectCategory: (id: string | null) => void;
}

export function TaskCategorySidebar({ selectedCategoryId, onSelectCategory }: TaskCategorySidebarProps) {
    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['taskCategories'],
        queryFn: api.getTaskCategories
    });

    return (
        <aside className="w-[260px] flex-shrink-0 border-r border-slate-200 bg-white h-full flex flex-col pt-6">
            <div className="px-6 mb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</h3>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-1">
                <button
                    onClick={() => onSelectCategory(null)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedCategoryId === null
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    <div className="w-3 h-3 rounded-full mr-3 border-2 border-slate-300" />
                    All Categories
                </button>

                {isLoading ? (
                    <div className="space-y-1 px-1">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ) : (
                    categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${selectedCategoryId === category.id
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <div
                                className="w-3 h-3 rounded-full mr-3 border border-black/5"
                                style={{ backgroundColor: category.color || '#CBD5E1' }}
                            />
                            <span className="truncate">{category.name}</span>
                        </button>
                    ))
                )}
            </div>
        </aside>
    );
}
