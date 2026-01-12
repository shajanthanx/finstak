import React from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy, Target, Calendar, Activity, CheckCircle } from 'lucide-react';
import { HabitStatsResponse } from '@/types';

interface HabitKPIsProps {
    data: HabitStatsResponse;
    loading: boolean;
}

export function HabitKPIs({ data, loading }: HabitKPIsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-slate-100 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    const totalHabits = data.habits.length;

    // Calculate average completion rate for the period
    const totalDays = data.dailyStats.length;
    const avgCompletion = totalDays > 0
        ? Math.round(data.dailyStats.reduce((acc, curr) => acc + curr.percentage, 0) / totalDays)
        : 0;

    // Calculate best day
    const bestDay = data.dailyStats.reduce((max, curr) =>
        curr.percentage > max.percentage ? curr : max
        , { percentage: 0, date: '' });

    // Calculate total completions (log count)
    const totalCompletions = Object.values(data.logs).reduce((total, dateMap) => {
        return total + Object.values(dateMap).filter(v => v > 0).length;
    }, 0);

    // Find custom stats using habits data if accessible, but we only have dailyStats and logs here.
    // We can infer "Most Consistent" by checking which habit ID has most logs.
    let bestHabitId = -1;
    let maxLogs = -1;
    Object.entries(data.logs).forEach(([id, dateMap]) => {
        const count = Object.values(dateMap).filter(v => v > 0).length;
        if (count > maxLogs) {
            maxLogs = count;
            bestHabitId = parseInt(id);
        }
    });

    // We need habit name, look it up in data.habits
    const bestHabit = data.habits.find(h => h.id === bestHabitId);

    const stats = [
        {
            label: "Monthly Completion",
            value: `${avgCompletion}%`,
            icon: Activity,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-slate-200"
        },
        {
            label: "Total Completions",
            value: totalCompletions.toString(),
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-slate-200"
        },
        {
            label: "Best Day",
            value: bestDay.date ? new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) : '-',
            sub: bestDay.percentage > 0 ? `${bestDay.percentage}%` : '',
            icon: Calendar,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-slate-200"
        },
        {
            label: "Top Habit",
            value: bestHabit ? bestHabit.title : '-',
            sub: bestHabit ? `${maxLogs} days` : '',
            icon: Trophy,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-slate-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
                <div key={index} className={`relative overflow-hidden bg-white p-5 rounded-2xl border ${stat.border} shadow-sm group hover:shadow-md transition-all duration-300`}>
                    <div className="flex items-start justify-between relative z-10">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{stat.label}</p>
                            <div className="mt-3 flex flex-col gap-1">
                                <span
                                    className={`font-bold text-slate-900 tracking-tight ${stat.label === "Top Habit" ? "text-base line-clamp-2 leading-snug" : "text-3xl"}`}
                                    title={stat.label === "Top Habit" ? stat.value : undefined}
                                >
                                    {stat.value}
                                </span>
                                {stat.sub && (
                                    <div className="flex">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                                            {stat.sub}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
