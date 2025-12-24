"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";

import Link from "next/link";

export function RecentTransactions() {
    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: api.getTransactions
    });

    if (isLoading) {
        return <Card className="col-span-1 lg:col-span-2 p-6 h-[400px] animate-pulse bg-slate-50" />;
    }

    return (
        <Card className="col-span-1 lg:col-span-2 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Recent Transactions</h3>
                <Link href="/transactions" className="text-sm text-slate-500 hover:text-slate-900">View All</Link>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-3">Transaction</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transactions?.slice(0, 5).map((t) => (
                            <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-lg group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-slate-200">
                                            {t.icon}
                                        </div>
                                        <span className="font-medium text-slate-900">{t.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{t.category}</td>
                                <td className="px-6 py-4 text-slate-500">{t.date}</td>
                                <td className={`px-6 py-4 text-right font-medium ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    {t.type === 'income' ? '+' : ''}{t.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
}
