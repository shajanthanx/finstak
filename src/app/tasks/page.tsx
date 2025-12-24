"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, ListTodo, ChevronDown, Eye, Edit3, Trash2, X,
    FileText, CheckCircle2, GripVertical, Save, Check,
    Filter, SlidersHorizontal
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types";

export default function TasksPage() {
    const queryClient = useQueryClient();
    const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);
    const [expandedTab, setExpandedTab] = useState<'view' | 'checklist' | 'notes' | null>(null);
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [quickAddText, setQuickAddText] = useState('');
    const [quickAddPriority, setQuickAddPriority] = useState<TaskPriority>('medium');

    // Filtering State
    const [basicFilter, setBasicFilter] = useState<'all' | 'high' | 'active' | 'completed'>('all');
    const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [advancedFilters, setAdvancedFilters] = useState({
        priorities: [] as TaskPriority[],
        statuses: [] as TaskStatus[],
        categories: [] as string[],
        dateStart: '',
        dateEnd: ''
    });

    // Editing State
    const [editTitle, setEditTitle] = useState('');
    const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
    const [editDate, setEditDate] = useState('');

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: api.getTasks
    });

    const createMutation = useMutation({
        mutationFn: api.createTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, task }: { id: number; task: Partial<Task> }) =>
            api.updateTask(id, task),
        onMutate: async (newUpdate) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['tasks'] });

            // Snapshot the previous value
            const previousTasks = queryClient.getQueryData(['tasks']);

            // Optimistically update to the new value
            queryClient.setQueryData(['tasks'], (old: Task[]) =>
                old?.map(t => t.id === newUpdate.id ? { ...t, ...newUpdate.task } : t)
            );

            // Return a context object with the snapshotted value
            return { previousTasks };
        },
        onError: (err, newUpdate, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            queryClient.setQueryData(['tasks'], context?.previousTasks);
        },
        onSettled: () => {
            // Always refetch after error or success to throw away the optimistic update and ensure we have the truth
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: api.deleteTask,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] })
    });

    // Extract unique categories
    const categories = useMemo(() =>
        [...new Set(tasks.map(t => t.category))].filter(Boolean),
        [tasks]
    );

    // Date filter helpers
    const isDateInFilter = (dateStr: string, filterType: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        d.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (filterType === 'today') return d.getTime() === today.getTime();
        if (filterType === 'week') {
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            return d >= startOfWeek && d <= endOfWeek;
        }
        if (filterType === 'month') {
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        }
        return true;
    };

    const isDateInRange = (dateStr: string, start: string, end: string) => {
        if (!start && !end) return true;
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);

        let validStart = true;
        let validEnd = true;

        if (start) {
            const s = new Date(start);
            s.setHours(0, 0, 0, 0);
            validStart = d >= s;
        }
        if (end) {
            const e = new Date(end);
            e.setHours(0, 0, 0, 0);
            validEnd = d <= e;
        }
        return validStart && validEnd;
    };

    const isAdvancedActive = useMemo(() => {
        return advancedFilters.priorities.length > 0 ||
            advancedFilters.statuses.length > 0 ||
            advancedFilters.categories.length > 0 ||
            advancedFilters.dateStart ||
            advancedFilters.dateEnd;
    }, [advancedFilters]);

    const filteredTasks = useMemo(() => {
        const filtered = tasks.filter(t => {
            if (isAdvancedActive) {
                const matchPriority = advancedFilters.priorities.length === 0 ||
                    advancedFilters.priorities.includes(t.priority);
                const matchStatus = advancedFilters.statuses.length === 0 ||
                    advancedFilters.statuses.includes(t.status);
                const matchCategory = advancedFilters.categories.length === 0 ||
                    advancedFilters.categories.includes(t.category);
                const matchDate = isDateInRange(t.dueDate, advancedFilters.dateStart, advancedFilters.dateEnd);
                return matchPriority && matchStatus && matchCategory && matchDate;
            }

            let matchesBasic = true;
            if (basicFilter === 'high') matchesBasic = t.priority === 'high';
            else if (basicFilter === 'active') matchesBasic = !t.completed;
            else if (basicFilter === 'completed') matchesBasic = t.completed;

            let matchesTime = true;
            if (timeFilter !== 'all') {
                matchesTime = isDateInFilter(t.dueDate, timeFilter);
            }

            return matchesBasic && matchesTime;
        });

        // Sort: Incomplete tasks first, then newest first
        return [...filtered].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            return b.id - a.id;
        });
    }, [tasks, basicFilter, timeFilter, advancedFilters, isAdvancedActive]);

    const handleAdvancedChange = (key: string, value: any) => {
        setAdvancedFilters(prev => {
            const current = (prev as any)[key];
            let updated;

            if (Array.isArray(current)) {
                updated = current.includes(value)
                    ? current.filter((item: any) => item !== value)
                    : [...current, value];
            } else {
                updated = value;
            }

            return { ...prev, [key]: updated };
        });
    };

    const clearAdvancedFilters = () => {
        setAdvancedFilters({
            priorities: [],
            statuses: [],
            categories: [],
            dateStart: '',
            dateEnd: ''
        });
    };

    const handleQuickAdd = () => {
        if (!quickAddText.trim()) return;
        const newTask: Task = {
            id: Date.now(),
            title: quickAddText,
            category: 'Personal',
            priority: quickAddPriority,
            dueDate: new Date().toISOString().split('T')[0],
            completed: false,
            status: 'todo',
            subtasks: [],
            notes: ''
        };
        createMutation.mutate(newTask);
        setQuickAddText('');
        setQuickAddPriority('medium');
    };

    const startEditing = (task: Task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditPriority(task.priority);
        setEditDate(task.dueDate);
        setExpandedTaskId(null);
        setExpandedTab(null);
    };

    const saveEditing = (taskId: number) => {
        updateMutation.mutate({
            id: taskId,
            task: { title: editTitle, priority: editPriority, dueDate: editDate }
        });
        setEditingTaskId(null);
    };

    const cancelEditing = () => {
        setEditingTaskId(null);
    };

    const updateTaskStatus = (taskId: number, isCompleted: boolean) => {
        updateMutation.mutate({
            id: taskId,
            task: { completed: isCompleted, status: isCompleted ? 'done' : 'todo' }
        });
    };

    const updateTaskNotes = (taskId: number, notes: string) => {
        updateMutation.mutate({ id: taskId, task: { notes } });
    };

    const toggleSubtask = (task: Task, subtaskId: number) => {
        const updatedSubtasks = task.subtasks.map(st =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        updateMutation.mutate({ id: task.id, task: { subtasks: updatedSubtasks } });
    };

    const addSubtask = (task: Task, title: string) => {
        if (!title.trim()) return;
        const newSubtask = { id: Date.now(), title, completed: false };
        updateMutation.mutate({
            id: task.id,
            task: { subtasks: [...task.subtasks, newSubtask] }
        });
    };

    const handleExpand = (taskId: number, tab: 'view' | 'checklist' | 'notes') => {
        if (expandedTaskId === taskId && expandedTab === tab) {
            setExpandedTaskId(null);
            setExpandedTab(null);
        } else {
            setExpandedTaskId(taskId);
            setExpandedTab(tab);
            setEditingTaskId(null);
        }
    };

    const getPriorityPill = (priority: TaskPriority) => {
        switch (priority) {
            case 'high': return <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase">High</span>;
            case 'medium': return <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold uppercase">Medium</span>;
            case 'low': return <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold uppercase">Low</span>;
        }
    };

    const getBasicFilterCount = (filterType: string) => {
        return tasks.filter(t => {
            let matchesBasic = true;
            if (filterType === 'high') matchesBasic = t.priority === 'high';
            else if (filterType === 'active') matchesBasic = !t.completed;
            else if (filterType === 'completed') matchesBasic = t.completed;

            let matchesTime = true;
            if (timeFilter !== 'all') {
                matchesTime = isDateInFilter(t.dueDate, timeFilter);
            }

            return matchesBasic && matchesTime;
        }).length;
    };

    if (isLoading) return <div className="p-8 animate-pulse">Loading tasks...</div>;

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
            {/* Quick Add Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Add a new task..."
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
                    value={quickAddText}
                    onChange={(e) => setQuickAddText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                />
                <div className="flex gap-3">
                    <div className="relative min-w-[120px]">
                        <select
                            value={quickAddPriority}
                            onChange={(e) => setQuickAddPriority(e.target.value as TaskPriority)}
                            className="w-full appearance-none px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                        onClick={handleQuickAdd}
                        className="px-6 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 active:scale-95 transition-all flex items-center whitespace-nowrap cursor-pointer"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Add
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="relative">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-2 border-b border-slate-100">
                    {/* Basic Filters */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'high', label: 'High Priority' },
                            { id: 'active', label: 'Active' },
                            { id: 'completed', label: 'Completed' }
                        ].map(tab => {
                            const count = getBasicFilterCount(tab.id);
                            const isActive = !isAdvancedActive && basicFilter === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setBasicFilter(tab.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center cursor-pointer ${isActive
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    {tab.label}
                                    <span className="ml-1.5 opacity-70">({count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Time Filter + Advanced */}
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                            {[
                                { id: 'all', label: 'Any' },
                                { id: 'today', label: 'Today' },
                                { id: 'week', label: 'Week' },
                                { id: 'month', label: 'Month' },
                            ].map(tab => {
                                const isActive = !isAdvancedActive && timeFilter === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setTimeFilter(tab.id as any)}
                                        className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${isActive
                                            ? 'bg-white text-slate-800 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {tab.label}
                                    </button>
                                )
                            })}
                        </div>

                        <button
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                            className={`flex-shrink-0 flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${isAdvancedOpen || isAdvancedActive
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            <SlidersHorizontal size={14} className="mr-1.5" />
                            Filters
                            {isAdvancedActive && <div className="ml-2 w-2 h-2 rounded-full bg-indigo-500"></div>}
                        </button>
                    </div>
                </div>

                {/* Advanced Filter Drawer */}
                {isAdvancedOpen && (
                    <div className="mt-3 p-5 bg-white border border-slate-200 rounded-xl shadow-sm animate-fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Priorities */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
                                <div className="space-y-1">
                                    {(['high', 'medium', 'low'] as TaskPriority[]).map(p => (
                                        <label key={p} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={advancedFilters.priorities.includes(p)}
                                                onChange={() => handleAdvancedChange('priorities', p)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                                            />
                                            <span className="capitalize">{p}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                                <div className="space-y-1">
                                    {(['todo', 'in-progress', 'done'] as TaskStatus[]).map(s => (
                                        <label key={s} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={advancedFilters.statuses.includes(s)}
                                                onChange={() => handleAdvancedChange('statuses', s)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                                            />
                                            <span className="capitalize">{s === 'in-progress' ? 'In Progress' : s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {categories.map(c => (
                                        <label key={c} className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={advancedFilters.categories.includes(c)}
                                                onChange={() => handleAdvancedChange('categories', c)}
                                                className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 cursor-pointer"
                                            />
                                            <span>{c}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Range</label>
                                <div className="space-y-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 mb-1">From</span>
                                        <input
                                            type="date"
                                            className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:border-indigo-500 outline-none"
                                            value={advancedFilters.dateStart}
                                            onChange={(e) => handleAdvancedChange('dateStart', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 mb-1">To</span>
                                        <input
                                            type="date"
                                            className="text-xs border border-slate-200 rounded px-2 py-1.5 focus:border-indigo-500 outline-none"
                                            value={advancedFilters.dateEnd}
                                            onChange={(e) => handleAdvancedChange('dateEnd', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end pt-4 border-t border-slate-100 gap-3">
                            <button
                                onClick={clearAdvancedFilters}
                                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={() => setIsAdvancedOpen(false)}
                                className="px-6 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Active Filters Chips */}
                {isAdvancedActive && !isAdvancedOpen && (
                    <div className="mt-3 flex flex-wrap gap-2 items-center animate-fade-in">
                        <span className="text-xs font-semibold text-slate-500 mr-1">Active:</span>
                        {advancedFilters.priorities.map(p => (
                            <span key={p} className="inline-flex items-center px-2 py-1 rounded bg-rose-50 text-rose-700 text-[10px] font-medium border border-rose-100 capitalize">
                                {p} Priority <button onClick={() => handleAdvancedChange('priorities', p)} className="ml-1 hover:text-rose-900"><X size={10} /></button>
                            </span>
                        ))}
                        {advancedFilters.statuses.map(s => (
                            <span key={s} className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-100 capitalize">
                                {s} <button onClick={() => handleAdvancedChange('statuses', s)} className="ml-1 hover:text-blue-900"><X size={10} /></button>
                            </span>
                        ))}
                        {advancedFilters.categories.map(c => (
                            <span key={c} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                                {c} <button onClick={() => handleAdvancedChange('categories', c)} className="ml-1 hover:text-slate-900"><X size={10} /></button>
                            </span>
                        ))}
                        {(advancedFilters.dateStart || advancedFilters.dateEnd) && (
                            <span className="inline-flex items-center px-2 py-1 rounded bg-amber-50 text-amber-700 text-[10px] font-medium border border-amber-100">
                                Date Range <button onClick={() => { handleAdvancedChange('dateStart', ''); handleAdvancedChange('dateEnd', ''); }} className="ml-1 hover:text-amber-900"><X size={10} /></button>
                            </span>
                        )}
                        <button onClick={clearAdvancedFilters} className="text-[10px] text-slate-400 hover:text-rose-500 underline ml-2">Clear all</button>
                    </div>
                )}
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 pt-2">
                {filteredTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                            <Filter className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-slate-900 font-medium mb-1">No tasks found</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">Try adjusting your filters or search criteria to find what you're looking for.</p>
                        <button onClick={clearAdvancedFilters} className="mt-4 text-indigo-600 text-sm font-medium hover:underline">Clear filters</button>
                    </div>
                ) : (
                    filteredTasks.map((task) => {
                        const isExpanded = expandedTaskId === task.id;
                        const isEditing = editingTaskId === task.id;
                        const progress = task.subtasks.length > 0
                            ? Math.round((task.subtasks.filter(s => s.completed).length / task.subtasks.length) * 100)
                            : 0;

                        return (
                            <div
                                key={task.id}
                                className={`bg-white rounded-xl border border-slate-100 p-4 transition-all duration-200 hover:shadow-md ${isExpanded || isEditing ? 'shadow-md ring-1 ring-slate-200' : ''}`}
                            >
                                <div className="flex items-start gap-4">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => updateTaskStatus(task.id, !task.completed)}
                                        className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer ${task.completed
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white border-slate-300 hover:border-indigo-400'
                                            }`}
                                    >
                                        {task.completed && <CheckCircle2 size={14} className="pointer-events-none" />}
                                    </button>

                                    {/* Task Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            {isEditing ? (
                                                <div className="flex-1 mr-4 space-y-3">
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full text-base font-medium text-slate-900 border-b border-indigo-300 focus:border-indigo-600 outline-none pb-1"
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-2">
                                                        <select
                                                            value={editPriority}
                                                            onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                                                            className="text-xs border border-slate-200 rounded px-2 py-1"
                                                        >
                                                            <option value="high">High</option>
                                                            <option value="medium">Medium</option>
                                                            <option value="low">Low</option>
                                                        </select>
                                                        <input
                                                            type="date"
                                                            value={editDate}
                                                            onChange={(e) => setEditDate(e.target.value)}
                                                            className="text-xs border border-slate-200 rounded px-2 py-1"
                                                        />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 cursor-pointer" onClick={() => handleExpand(task.id, 'view')}>
                                                    <h3 className={`text-base font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                                                        {task.title}
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        {getPriorityPill(task.priority)}
                                                        <span className="text-xs text-slate-500 font-medium">
                                                            {task.subtasks.length > 0 ? `${progress}% complete` : ''}
                                                        </span>
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Action Icons */}
                                            <div className="flex items-center gap-1">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEditing(task.id)}
                                                            className="p-2 rounded-lg text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                                                        >
                                                            <Check size={18} />
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleExpand(task.id, 'view'); }}
                                                            className={`p-2 rounded-lg transition-colors cursor-pointer ${expandedTab === 'view' && isExpanded
                                                                ? 'text-indigo-600 bg-indigo-50 ring-1 ring-indigo-100'
                                                                : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
                                                                }`}
                                                            title="View Details"
                                                        >
                                                            <Eye size={18} />
                                                        </button>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleExpand(task.id, 'checklist'); }}
                                                            className={`p-2 rounded-lg transition-colors cursor-pointer ${expandedTab === 'checklist' && isExpanded
                                                                ? 'text-indigo-600 bg-indigo-50 ring-1 ring-indigo-100'
                                                                : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
                                                                }`}
                                                            title="Checklist"
                                                        >
                                                            <div className="relative">
                                                                <ListTodo size={18} />
                                                                {task.subtasks.length > 0 && !isExpanded && (
                                                                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white" />
                                                                )}
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleExpand(task.id, 'notes'); }}
                                                            className={`p-2 rounded-lg transition-colors cursor-pointer ${expandedTab === 'notes' && isExpanded
                                                                ? 'text-indigo-600 bg-indigo-50 ring-1 ring-indigo-100'
                                                                : 'text-slate-400 hover:bg-slate-50 hover:text-indigo-600'
                                                                }`}
                                                            title="Notes"
                                                        >
                                                            <div className="relative">
                                                                <FileText size={18} />
                                                                {task.notes && !isExpanded && (
                                                                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-white" />
                                                                )}
                                                            </div>
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); startEditing(task); }}
                                                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-indigo-600 transition-colors cursor-pointer"
                                                            title="Edit Details"
                                                        >
                                                            <Edit3 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(task.id); }}
                                                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Area */}
                                {isExpanded && (
                                    <TaskDetailPanel
                                        task={task}
                                        tab={expandedTab}
                                        onUpdateTaskNotes={(notes) => updateTaskNotes(task.id, notes)}
                                        onToggleSubtask={(subId) => toggleSubtask(task, subId)}
                                        onAddSubtask={(title) => addSubtask(task, title)}
                                        onDeleteSubtask={(subId) => {
                                            const newSubtasks = task.subtasks.filter(s => s.id !== subId);
                                            updateMutation.mutate({ id: task.id, task: { subtasks: newSubtasks } });
                                        }}
                                        onClose={() => { setExpandedTaskId(null); setExpandedTab(null); }}
                                    />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// Sub-components to prevent re-renders inside of main component loop
function TaskDetailPanel({
    task,
    tab,
    onUpdateTaskNotes,
    onToggleSubtask,
    onAddSubtask,
    onDeleteSubtask,
    onClose
}: {
    task: Task;
    tab: 'view' | 'checklist' | 'notes' | null;
    onUpdateTaskNotes: (notes: string) => void;
    onToggleSubtask: (subId: number) => void;
    onAddSubtask: (title: string) => void;
    onDeleteSubtask: (subId: number) => void;
    onClose: () => void;
}) {
    const [subtaskInput, setSubtaskInput] = useState('');

    if (tab === 'view') {
        return (
            <div className="mt-4 pl-0 md:pl-8 space-y-6 animate-fade-in border-t border-slate-100 pt-4">
                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <ListTodo size={14} /> Checklist
                    </h4>
                    {task.subtasks.length === 0 ? (
                        <p className="text-sm text-slate-400 italic">No checklist items.</p>
                    ) : (
                        <div className="space-y-2">
                            {task.subtasks.map(st => (
                                <div key={st.id} className="flex items-center">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${st.completed ? 'bg-indigo-100 border-indigo-100 text-indigo-600' : 'border-slate-300'}`}>
                                        {st.completed && <CheckCircle2 size={10} />}
                                    </div>
                                    <span className={`text-sm ${st.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{st.title}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <FileText size={14} /> Notes
                    </h4>
                    <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 min-h-[60px]">
                        {task.notes || <span className="text-slate-400 italic">No notes added.</span>}
                    </div>
                </div>
            </div>
        );
    }

    if (tab === 'checklist') {
        return (
            <div className="mt-4 pl-0 md:pl-8 space-y-6 animate-fade-in border-t border-slate-100 pt-4">
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <ListTodo size={14} /> Checklist
                        </h4>
                    </div>
                    <div className="space-y-2 mb-4">
                        {task.subtasks.map(st => (
                            <div key={st.id} className="flex items-center group">
                                <button
                                    onClick={() => onToggleSubtask(st.id)}
                                    className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors cursor-pointer ${st.completed ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 hover:border-indigo-400'}`}
                                >
                                    {st.completed && <CheckCircle2 size={12} />}
                                </button>
                                <span className={`text-sm flex-1 ${st.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{st.title}</span>
                                <button
                                    onClick={() => onDeleteSubtask(st.id)}
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add an item..."
                            className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
                            value={subtaskInput}
                            onChange={(e) => setSubtaskInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (onAddSubtask(subtaskInput), setSubtaskInput(''))}
                        />
                        <button
                            onClick={() => { onAddSubtask(subtaskInput); setSubtaskInput(''); }}
                            className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (tab === 'notes') {
        return <NotesTab task={task} onUpdateTaskNotes={onUpdateTaskNotes} onClose={onClose} />;
    }

    return null;
}

function NotesTab({ task, onUpdateTaskNotes, onClose }: { task: Task; onUpdateTaskNotes: (notes: string) => void; onClose: () => void }) {
    const [localNotes, setLocalNotes] = useState(task.notes || '');

    const handleSave = () => {
        if (localNotes !== (task.notes || '')) {
            onUpdateTaskNotes(localNotes);
        }
    };

    return (
        <div className="mt-4 pl-0 md:pl-8 space-y-6 animate-fade-in border-t border-slate-100 pt-4">
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={14} /> Notes
                    </h4>
                    {localNotes !== (task.notes || '') && (
                        <span className="text-[10px] text-amber-500 font-medium animate-pulse">Unsaved changes...</span>
                    )}
                </div>
                <textarea
                    placeholder="Add details, links, or context..."
                    className="w-full h-32 p-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none transition-colors"
                    value={localNotes}
                    onChange={(e) => setLocalNotes(e.target.value)}
                    onBlur={handleSave}
                />
                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleSave}
                        className="flex items-center px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                    >
                        <Save size={14} className="mr-2" /> Save Notes
                    </button>
                </div>
            </div>
        </div>
    );
}
