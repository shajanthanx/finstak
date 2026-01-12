"use client";

import React, { useRef, useState } from 'react';
import { Habit, HabitLog, DailyHabitStat } from '@/types';
import { HabitChart } from './HabitChart';
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
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative">
            {/* Main Flex Container */}
            {/* Main Content Area */}
            <div className="overflow-auto relative w-full h-full" ref={scrollContainerRef}>
                <div className="flex flex-col min-w-max">
                    <div className="flex">
                        {/* Corner Piece (Sticky Top Left) */}
                        <div className="sticky left-0 top-0 z-30 w-64 h-[160px] bg-white border-r border-b border-slate-200 flex flex-col flex-shrink-0">
                            {/* Top: Aligned with Chart */}
                            <div className="h-[110px] flex items-center justify-center p-4 bg-slate-50/50">
                                <div className="text-center">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Progress</p>
                                    <p className="text-[10px] text-slate-400 mt-1">Last {dates.length} Days</p>
                                </div>
                            </div>
                            {/* Bottom: Aligned with Dates */}
                            <div className="h-[50px] flex items-center px-4 border-t border-slate-100 bg-slate-50">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Habit Name</span>
                            </div>
                        </div>

                        {/* Chart + Dates Header (Sticky Top) */}
                        <div className="sticky top-0 z-20 h-[160px] bg-white border-b border-slate-200 flex flex-col">
                            {/* Chart Row */}
                            <div className="h-[110px] w-full relative">
                                <HabitChart data={dailyStats} width={gridWidth} height={110} />
                            </div>
                            {/* Dates Row */}
                            <div className="h-[50px] flex items-center border-t border-slate-100 bg-slate-50/50">
                                {dates.map((date, i) => {
                                    const d = new Date(date);
                                    // Hack: adding time to force local parsing if needed, but we already handled strict dates strings
                                    // Actually d is UTC if date is YYYY-MM-DD. 
                                    // We want "Nov 12" based on the string.
                                    // Best to use UTC methods because input is YYYY-MM-DD
                                    const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
                                    const day = d.getUTCDate();

                                    const isFirstOfMonth = day === 1;
                                    const isToday = date === new Date().toISOString().split('T')[0];

                                    return (
                                        <div key={date} className={cn(
                                            "w-[50px] flex-shrink-0 flex items-center justify-center h-full border-r border-slate-100/50 relative overflow-hidden",
                                            isFirstOfMonth && "border-l-2 border-l-slate-300"
                                        )}>
                                            <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-medium text-slate-500 tracking-wide">
                                                <span className={isToday ? "text-blue-600 font-bold" : ""}>
                                                    {month} {day}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Habit Rows */}
                    {habits.map((habit) => (
                        <div key={habit.id} className="flex group hover:bg-slate-50 transition-colors">
                            {/* Sticky Left Habit Name */}
                            <div className="sticky left-0 z-10 w-64 bg-white group-hover:bg-slate-50 border-r border-slate-200 p-3 flex items-center justify-between flex-shrink-0">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <span className="text-xl">{habit.icon}</span>
                                    <div className="min-w-0">
                                        <p className="font-medium text-slate-900 truncate">{habit.title}</p>
                                        <p className="text-xs text-slate-400 truncate">{habit.description || `${habit.frequency}`}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Checkbox Cells */}
                            <div className="flex h-16 items-center">
                                {dates.map((date) => {
                                    const isCompleted = (logs[habit.id]?.[date] || 0) >= habit.goalTarget;
                                    const isToday = date === new Date().toISOString().split('T')[0];
                                    const key = `${habit.id}-${date}`;
                                    const isLoading = toggling === key;
                                    const isFirstOfMonth = new Date(date).getDate() === 1;

                                    return (
                                        <div key={date} className={cn(
                                            "w-[50px] h-full flex items-center justify-center border-r border-slate-100/50 flex-shrink-0",
                                            isToday && "bg-blue-50/30",
                                            isFirstOfMonth && "border-l-2 border-l-slate-300"
                                        )}>
                                            <button
                                                onClick={() => handleToggle(habit.id, date, isCompleted ? 0 : 1)}
                                                disabled={isLoading}
                                                className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                                                    isCompleted
                                                        ? "bg-blue-500 text-white shadow-sm shadow-blue-200 scale-100"
                                                        : "bg-slate-100 text-slate-300 hover:bg-slate-200 scale-90",
                                                    isLoading && "opacity-50 cursor-wait"
                                                )}
                                            >
                                                {isCompleted && <Check className="w-5 h-5" strokeWidth={3} />}
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
    );
}
