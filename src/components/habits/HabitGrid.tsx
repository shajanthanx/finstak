"use client";

import React, { useRef, useState } from 'react';
import { Habit, HabitLog, DailyHabitStat } from '@/types';
import { HabitChart } from './HabitChart';
import { getIcon } from "@/lib/icon-map";
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn exists, standard in shadcn projects

interface HabitGridProps {
    habits: Habit[];
    logs: Record<number, Record<string, number>>;
    dailyStats: DailyHabitStat[];
    startDate: string;
    endDate: string;
    onToggle: (habitId: number, date: string, currentValue: number) => Promise<void>;
    onAddHabit: () => void;
}

export function HabitGrid({ habits, logs, dailyStats, startDate, endDate, onToggle, onAddHabit }: HabitGridProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [toggling, setToggling] = useState<string | null>(null);

    // Generate date array
    const dates: string[] = [];
    const curr = new Date(startDate);
    const end = new Date(endDate);
    while (curr <= end) {
        dates.push(curr.toISOString().split('T')[0]);
        curr.setDate(curr.getDate() + 1);
    }

    const COL_WIDTH = 50;
    const gridWidth = dates.length * COL_WIDTH;

    // Helper to format date header
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return {
            day: d.getDate(),
            weekday: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
            isToday: dateStr === new Date().toISOString().split('T')[0]
        };
    };

    const handleToggle = async (habitId: number, date: string, val: number) => {
        const key = `${habitId}-${date}`;
        if (toggling === key) return;
        setToggling(key);
        try {
            await onToggle(habitId, date, val);
        } finally {
            setToggling(null);
        }
    };

    return (
        <div className="flex flex-col h-full w-full bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-200 overflow-hidden relative">
            {/* Main Content Area */}
            <div className="overflow-auto relative w-full h-full" ref={scrollContainerRef}>
                <div className="flex flex-col min-w-max">
                    <div className="flex bg-slate-50/50">
                        {/* Corner Piece (Sticky Top Left) */}
                        <div className="sticky left-0 top-0 z-30 w-72 h-[160px] bg-white border-r border-b border-slate-200 flex flex-col flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                            {/* Top: Aligned with Chart */}
                            <div className="h-[110px] flex items-center justify-center p-6 bg-slate-50/30">
                                <div className="text-center">
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Daily Progress</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Last {dates.length} Days</p>
                                </div>
                            </div>
                            {/* Bottom: Aligned with Dates */}
                            <div className="h-[50px] flex items-center px-6 border-t border-slate-100 bg-white">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Habit Name</span>
                            </div>
                        </div>

                        {/* Chart + Dates Header (Sticky Top) */}
                        <div className="sticky top-0 z-20 h-[160px] bg-white border-b border-slate-200 flex flex-col">
                            {/* Chart Row */}
                            <div className="h-[110px] w-full relative">
                                <HabitChart data={dailyStats} width={gridWidth} height={110} />
                            </div>
                            {/* Dates Row */}
                            <div className="h-[50px] flex items-center border-t border-slate-100 bg-slate-50/30">
                                {dates.map((date, i) => {
                                    const d = new Date(date);
                                    const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                                    const day = d.getUTCDate();

                                    const isFirstOfMonth = day === 1;
                                    const isToday = date === new Date().toISOString().split('T')[0];

                                    return (
                                        <div key={date} className={cn(
                                            "w-[50px] flex-shrink-0 flex items-center justify-center h-full border-r border-slate-100/50 relative overflow-hidden group hover:bg-slate-50 transition-colors",
                                            isFirstOfMonth && "border-l-[1.5px] border-l-slate-300"
                                        )}>
                                            <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-medium text-slate-400 tracking-wide select-none group-hover:text-slate-600 transition-colors">
                                                <span className={isToday ? "text-indigo-600 font-bold" : ""}>
                                                    {month} {day}
                                                </span>
                                            </div>
                                            {isToday && <div className="absolute bottom-0 w-full h-0.5 bg-indigo-600" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Habit Rows */}
                    <div className="divide-y divide-slate-100">
                        {habits.map((habit) => (
                            <div key={habit.id} className="flex group hover:bg-slate-50/50 transition-colors">
                                {/* Sticky Left Habit Name */}
                                <div className="sticky left-0 z-10 w-72 bg-white group-hover:bg-slate-50/50 border-r border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-xl shadow-sm border border-indigo-100 flex-shrink-0">
                                            {getIcon(habit.icon, "w-5 h-5 text-indigo-600")}
                                        </div>
                                        <div className="min-w-0" title={habit.title}>
                                            <p className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2 break-words">{habit.title}</p>
                                            <p className="text-[11px] text-slate-400 truncate mt-0.5">{habit.description || ''}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Checkbox Cells */}
                                <div className="flex h-[72px] items-center">
                                    {dates.map((date) => {
                                        const isCompleted = (logs[habit.id]?.[date] || 0) >= 1;
                                        const isToday = date === new Date().toISOString().split('T')[0];
                                        const key = `${habit.id}-${date}`;
                                        const isLoading = toggling === key;
                                        const isFirstOfMonth = new Date(date).getDate() === 1;

                                        // Determine if editable based on activeFromDate
                                        const activeFrom = habit.activeFromDate || habit.startDate;
                                        const isEditable = date >= activeFrom;

                                        return (
                                            <div key={date} className={cn(
                                                "w-[50px] h-full flex items-center justify-center border-r border-slate-100/50 flex-shrink-0 transition-colors",
                                                isToday && "bg-blue-50/50",
                                                isFirstOfMonth && "border-l-[1.5px] border-l-slate-300",
                                                !isEditable && "bg-slate-50 opacity-50 cursor-not-allowed"
                                            )}>

                                                <button
                                                    onClick={() => isEditable && handleToggle(habit.id, date, isCompleted ? 0 : 1)}
                                                    disabled={!isEditable || isLoading}
                                                    className={cn(
                                                        "w-6 h-6 rounded-[6px] flex items-center justify-center transition-all duration-300 ease-out",
                                                        // Active & Completed
                                                        isCompleted && isEditable && "bg-indigo-500 text-white shadow-md shadow-indigo-200 scale-100 rotate-0",
                                                        // Active & Not Completed
                                                        !isCompleted && isEditable && "bg-slate-100/50 hover:bg-slate-200 text-transparent hover:scale-110 border border-slate-200 hover:border-slate-300",
                                                        // Disabled / Inactive
                                                        !isEditable && "bg-slate-200/50 border border-slate-300/50 text-slate-400 cursor-not-allowed",
                                                        // Loading
                                                        isLoading && "opacity-50 cursor-wait scale-90"
                                                    )}
                                                >
                                                    <Check className={cn("w-3.5 h-3.5 transition-transform duration-300", isCompleted ? "scale-100" : "scale-0")} strokeWidth={3.5} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
