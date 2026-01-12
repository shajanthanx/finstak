"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { HabitKPIs } from '@/components/habits/HabitKPIs';
import { HabitGrid } from '@/components/habits/HabitGrid';
import { AddHabitModal } from '@/components/habits/AddHabitModal';
import { Habit, HabitStatsResponse } from '@/types';
import { Button } from '@/components/ui/Button';
import { Plus, Calendar } from 'lucide-react';

type DateRange = 'week' | 'month' | 'year' | 'custom';

export default function HabitTrackerPage() {
    const [range, setRange] = useState<DateRange>('month');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    // Calculated dates
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [data, setData] = useState<HabitStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Initial Date Calculation
    useEffect(() => {
        const calculateDates = () => {
            const today = new Date();
            let start = new Date();
            let end = new Date();

            if (range === 'week') {
                // Start of week (Monday)
                const day = today.getDay();
                const diff = today.getDate() - day + (day === 0 ? -6 : 1);
                start.setDate(diff);
                end.setDate(start.getDate() + 6);
            } else if (range === 'month') {
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            } else if (range === 'year') {
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
            } else if (range === 'custom' && customStart && customEnd) {
                start = new Date(customStart);
                end = new Date(customEnd);
            }

            // Fix: Use local date strings to avoid timezone shifts (e.g. UTC-X moving to previous day)
            const toLocalISO = (d: Date) => {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            setStartDate(toLocalISO(start));
            setEndDate(toLocalISO(end));
        };

        calculateDates();
    }, [range, customStart, customEnd]);

    const fetchData = async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        try {
            const res = await api.getHabitStats(startDate, endDate);
            setData(res);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [startDate, endDate]);

    const handleToggle = async (habitId: number, date: string, val: number) => {
        // Optimistic update
        if (!data) return;

        // Deep copy to mutate safely (or use a smarter immutable pattern)
        const newData = JSON.parse(JSON.stringify(data));
        if (!newData.logs[habitId]) newData.logs[habitId] = {};
        newData.logs[habitId][date] = val;
        setData(newData);

        try {
            await api.logHabit(habitId, date, val);
            // In a real app, we might re-fetch stats to get accurate % calculations from server
            // For now, let's just re-fetch silently
            fetchData();
        } catch (error) {
            console.error(error);
            // Revert on error?
        }
    };

    const handleAddHabit = async (habit: Partial<Habit>) => {
        await api.createHabit(habit);
        fetchData();
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Habit Tracker</h1>
                    <p className="text-slate-500 text-sm">Build consistency with daily tracking.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Date Filters */}
                    <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex items-center">
                        <button
                            onClick={() => setRange('week')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${range === 'week' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            This Week
                        </button>
                        <button
                            onClick={() => setRange('month')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${range === 'month' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            This Month
                        </button>
                        <button
                            onClick={() => setRange('year')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${range === 'year' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            This Year
                        </button>
                    </div>

                    <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
                        <Plus className="w-4 h-4" />
                        New Habit
                    </Button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {/* KPIs */}
                {data && <HabitKPIs data={data} loading={loading} />}

                {/* Main Grid */}
                <div className="flex-1 min-h-0">
                    {data ? (
                        <HabitGrid
                            habits={data.habits}
                            logs={data.logs}
                            dailyStats={data.dailyStats}
                            startDate={startDate}
                            endDate={endDate}
                            onToggle={handleToggle}
                            onAddHabit={() => setIsAddModalOpen(true)}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            Loading...
                        </div>
                    )}
                </div>
            </div>

            <AddHabitModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSave={handleAddHabit}
            />
        </div>
    );
}
