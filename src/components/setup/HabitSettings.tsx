"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { Habit } from "@/types";
import { availableIcons, getIcon } from "@/lib/icon-map";

export function HabitSettings() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<Habit>>({});
    const [isCreating, setIsCreating] = useState(false);

    const fetchHabits = async () => {
        try {
            const res = await api.getHabits();
            setHabits(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHabits();
    }, []);

    const handleCreate = async () => {
        if (!editForm.title) return;
        try {
            await api.createHabit(editForm);
            setIsCreating(false);
            setEditForm({});
            fetchHabits();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (id: number) => {
        try {
            await api.updateHabit(id, editForm);
            setIsEditing(null);
            setEditForm({});
            fetchHabits();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to archive this habit?')) return;
        try {
            await api.deleteHabit(id);
            fetchHabits();
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (habit: Habit) => {
        setIsEditing(habit.id);
        setEditForm({
            title: habit.title,
            description: habit.description,
            activeFromDate: habit.activeFromDate,
            icon: habit.icon
        });
    };

    const cancelEdit = () => {
        setIsEditing(null);
        setIsCreating(false);
        setEditForm({});
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="space-y-6 h-full flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-medium text-slate-900">Habit Management</h2>
                    <p className="text-sm text-slate-500">Create, edit, and set start dates for your habits.</p>
                </div>
                <Button onClick={() => { setIsCreating(true); setEditForm({ activeFromDate: today, icon: 'Activity' }); }} className="gap-2 bg-slate-900 text-white">
                    <Plus className="w-4 h-4" />
                    Add Habit
                </Button>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 w-12">Icon</th>
                            <th className="px-6 py-4 w-1/4">Habit Title</th>
                            <th className="px-6 py-4 w-1/4">Description</th>
                            <th className="px-6 py-4">Active From</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isCreating && (
                            <tr className="bg-indigo-50/30">
                                <td className="px-6 py-4">
                                    <div className="relative group/picker">
                                        <div className="w-10 h-10 rounded-lg bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer shadow-sm relative z-50">
                                            {getIcon(editForm.icon || 'Activity', "w-5 h-5")}
                                        </div>
                                        {/* Simple Hover Dropdown for MVP - Fixed visibility */}
                                        <div className="absolute -top-20 left-full ml-2 p-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] w-64 h-48 overflow-y-auto grid grid-cols-5 gap-2 hidden group-hover/picker:grid animate-in fade-in zoom-in-95 duration-200">
                                            {availableIcons.map(ic => (
                                                <button
                                                    key={ic.name}
                                                    onClick={() => setEditForm({ ...editForm, icon: ic.name })}
                                                    className={`p-2 rounded-lg hover:bg-indigo-50 flex items-center justify-center ${editForm.icon === ic.name ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}
                                                    title={ic.name}
                                                >
                                                    <ic.icon className="w-4 h-4" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        placeholder="Enter habit title..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        value={editForm.title || ''}
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        autoFocus
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        placeholder="Description (optional)"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        value={editForm.description || ''}
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="date"
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        value={editForm.activeFromDate || ''}
                                        onChange={e => setEditForm({ ...editForm, activeFromDate: e.target.value })}
                                    />
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={handleCreate} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button onClick={cancelEdit} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}

                        {habits.map(habit => (
                            <tr key={habit.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    {isEditing === habit.id ? (
                                        <div className="relative group/picker">
                                            <div className="w-10 h-10 rounded-lg bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 cursor-pointer shadow-sm relative z-50">
                                                {getIcon(editForm.icon || habit.icon || 'Activity', "w-5 h-5")}
                                            </div>
                                            <div className="absolute -top-20 left-full ml-2 p-2 bg-white rounded-xl shadow-xl border border-slate-200 z-[100] w-64 h-48 overflow-y-auto grid grid-cols-5 gap-2 hidden group-hover/picker:grid animate-in fade-in zoom-in-95 duration-200">
                                                {availableIcons.map(ic => (
                                                    <button
                                                        key={ic.name}
                                                        onClick={() => setEditForm({ ...editForm, icon: ic.name })}
                                                        className={`p-2 rounded-lg hover:bg-indigo-50 flex items-center justify-center ${editForm.icon === ic.name ? 'bg-indigo-50 text-indigo-600' : 'text-slate-500'}`}
                                                        title={ic.name}
                                                    >
                                                        <ic.icon className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                                            {getIcon(habit.icon, "w-5 h-5")}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {isEditing === habit.id ? (
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            value={editForm.title || ''}
                                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                        />
                                    ) : (
                                        <span className="font-medium text-slate-700">{habit.title}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {isEditing === habit.id ? (
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            value={editForm.description || ''}
                                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                            placeholder="Description"
                                        />
                                    ) : (
                                        <span className="text-slate-500 truncate block max-w-[200px]">{habit.description || '-'}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-slate-500">
                                    {isEditing === habit.id ? (
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                            value={editForm.activeFromDate || habit.activeFromDate || habit.startDate || ''}
                                            onChange={e => setEditForm({ ...editForm, activeFromDate: e.target.value })}
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span>
                                                {habit.activeFromDate
                                                    ? new Date(habit.activeFromDate).toLocaleDateString()
                                                    : new Date(habit.startDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className={`flex items-center justify-end gap-2 transition-opacity ${isEditing === habit.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {isEditing === habit.id ? (
                                            <>
                                                <button onClick={() => handleUpdate(habit.id)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button onClick={cancelEdit} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => startEdit(habit)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(habit.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!loading && habits.length === 0 && !isCreating && (
                    <div className="flex-1 flex items-center justify-center p-12 text-center text-slate-400 bg-slate-50/50">
                        <div className="flex flex-col items-center gap-2">
                            <Calendar className="w-12 h-12 text-slate-300" />
                            <p>No habits found. Create one to get started!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
