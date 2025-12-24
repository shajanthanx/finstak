"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ListTodo } from "lucide-react";
import { useState, useMemo } from "react";
import { Task } from "@/types";

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks'],
        queryFn: api.getTasks
    });

    const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const calendarDays = useMemo(() => {
        const days = [];
        const totalDays = daysInMonth(currentDate);
        const startDay = startDayOfMonth(currentDate);

        // Padding for prev month
        for (let i = 0; i < startDay; i++) {
            days.push({ day: null, date: null, tasks: [] });
        }

        // Days
        for (let i = 1; i <= totalDays; i++) {
            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const dayTasks = tasks.filter((t: Task) => t.dueDate === dateStr);
            days.push({ day: i, date: dateStr, tasks: dayTasks });
        }
        return days;
    }, [currentDate, tasks]);

    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col font-sans">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                        <ListTodo className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Task Calendar</h2>
                </div>
                <div className="flex items-center bg-white border border-slate-200 rounded-xl px-1 py-1 shadow-sm">
                    <button
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-semibold text-sm px-4 min-w-[140px] text-center text-slate-700">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-600"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <Card className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {d}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 flex-1 overflow-y-auto">
                    {calendarDays.map((cell, idx) => (
                        <div
                            key={idx}
                            className={`border-b border-r border-slate-50/50 p-2 min-h-[120px] flex flex-col transition-colors group ${!cell.day ? 'bg-slate-50/10' : 'bg-white hover:bg-indigo-50/10'
                                }`}
                        >
                            {cell.day && (
                                <>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-xs font-bold leading-none w-6 h-6 flex items-center justify-center rounded-lg ${new Date().getDate() === cell.day &&
                                                new Date().getMonth() === currentDate.getMonth() &&
                                                new Date().getFullYear() === currentDate.getFullYear()
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                                : 'text-slate-400 group-hover:text-slate-900'
                                            }`}>
                                            {cell.day}
                                        </span>
                                    </div>
                                    <div className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
                                        {cell.tasks.map((t: Task) => (
                                            <div
                                                key={t.id}
                                                className={`text-[10px] px-2 py-1.5 rounded-lg border leading-tight truncate shadow-sm ${t.completed
                                                        ? 'bg-slate-50 text-slate-400 border-slate-200 line-through'
                                                        : t.priority === 'high'
                                                            ? 'bg-rose-50 text-rose-700 border-rose-100'
                                                            : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                                                    }`}
                                                title={t.title}
                                            >
                                                {t.title}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
