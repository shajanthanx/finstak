import React from 'react';
import { Card } from '@/components/ui/Card';
import { Trophy, Target, Calendar, Activity } from 'lucide-react';
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
            label: "Completion Rate",
            value: `${avgCompletion}%`,
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Total Completions",
            value: totalCompletions.toString(),
            icon: Target,
            color: "text-purple-600",
            bg: "bg-purple-50"
        },
        {
            label: "Best Day",
            value: bestDay.date ? new Date(bestDay.date).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }) : '-',
            sub: bestDay.percentage > 0 ? `${bestDay.percentage}%` : '',
            icon: Calendar,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Top Habit",
            value: bestHabit ? bestHabit.title : '-',
            sub: bestHabit ? `${maxLogs} days` : '',
            icon: Trophy,
            color: "text-amber-600",
            bg: "bg-amber-50"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <Card key={index} className="p-4 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <div className="mt-2 flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                                {stat.sub && <span className="text-xs font-medium text-emerald-600">{stat.sub}</span>}
                            </div>
                        </div>
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
