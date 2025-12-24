"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";

export function UpcomingBills() {
    const { data: bills, isLoading } = useQuery({
        queryKey: ['recurringBills'],
        queryFn: api.getRecurringBills
    });

    if (isLoading) {
        return <Card className="p-6 h-[200px] animate-pulse bg-slate-50" />;
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-slate-900">Upcoming Bills</h3>
                </div>
            </div>
            <div className="space-y-4">
                {bills?.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                        <div>
                            <p className="font-medium text-sm text-slate-900">{sub.name}</p>
                            <p className="text-xs text-slate-500">Due in {sub.due}</p>
                        </div>
                        <span className="font-semibold text-sm text-slate-900">${sub.amount}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
