"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp } from "lucide-react";

export function KPIStats() {
    const { data: kpis, isLoading } = useQuery({
        queryKey: ['kpis'],
        queryFn: api.getKPIs
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="p-6 h-32 animate-pulse bg-slate-50" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis?.map((stat, i) => (
                <Card key={i} className="p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        {stat.isPositive ? (
                            <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" /> {stat.trend}
                            </span>
                        ) : (
                            <span className="flex items-center text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                                <TrendingUp className="w-3 h-3 mr-1" /> {stat.trend}
                            </span>
                        )}
                    </div>
                    <div className="mt-4">
                        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{stat.value}</h3>
                        <p className="text-xs text-slate-400 mt-1">from last month</p>
                    </div>
                </Card>
            ))}
        </div>
    );
}
