"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export function CashFlowChart() {
    const { data: trendData, isLoading } = useQuery({
        queryKey: ['monthlyTrends'],
        queryFn: api.getMonthlyTrends
    });

    if (isLoading) {
        return <Card className="col-span-1 lg:col-span-2 p-6 h-[400px] animate-pulse bg-slate-50" />;
    }

    return (
        <Card className="col-span-1 lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="font-semibold text-slate-900">Cash Flow</h3>
                    <p className="text-sm text-slate-500">Income vs Expenses over time</p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-md px-2 py-1 outline-none cursor-pointer">
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                </select>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#18181b" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#18181b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ fontSize: '12px', fontWeight: 500 }}
                        />
                        <Area type="monotone" dataKey="income" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" dataKey="expense" stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
