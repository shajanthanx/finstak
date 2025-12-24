"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { ListTodo, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

export function TasksOverview() {
    const { data: tasks, isLoading } = useQuery({
        queryKey: ['tasks'],
        queryFn: api.getTasks
    });

    if (isLoading) {
        return <Card className="p-6 h-[250px] animate-pulse bg-slate-50" />;
    }

    const totalTasks = tasks?.length || 0;
    const completedTasks = tasks?.filter(t => t.completed).length || 0;
    const pendingTasks = totalTasks - completedTasks;
    const highPriorityPending = tasks?.filter(t => !t.completed && t.priority === 'high') || [];

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                    <ListTodo className="w-4 h-4 text-indigo-500" />
                    <h3 className="font-semibold text-slate-900">Tasks Summary</h3>
                </div>
                <Link href="/tasks" className="text-xs font-medium text-indigo-600 hover:text-indigo-700">
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100/50">
                    <div className="flex items-center justify-between mb-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[10px] font-bold text-indigo-600 uppercase">Pending</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{pendingTasks}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50">
                    <div className="flex items-center justify-between mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Done</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">{completedTasks}</p>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Priority Focus</p>
                {highPriorityPending.length > 0 ? (
                    highPriorityPending.slice(0, 2).map((task) => (
                        <div key={task.id} className="flex items-start space-x-3 p-3 rounded-lg border border-rose-100 bg-rose-50/30">
                            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                                <p className="text-[10px] text-rose-600 font-medium uppercase mt-0.5">Due: {task.dueDate}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        <p className="text-xs text-slate-500">No urgent tasks!</p>
                    </div>
                )}
            </div>
        </Card>
    );
}
