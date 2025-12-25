"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { useMemo } from "react";

export function UpcomingBills() {
    const { data: installments, isLoading } = useQuery({
        queryKey: ['installments'],
        queryFn: api.getInstallments
    });

    // Calculate upcoming payments from installments
    const upcomingPayments = useMemo(() => {
        if (!installments) return [];

        return installments
            .filter(inst => inst.paidMonths < inst.totalMonths)
            .map(inst => {
                const monthlyAmount = inst.totalAmount / inst.totalMonths;
                const remainingMonths = inst.totalMonths - inst.paidMonths;
                const nextPaymentDate = new Date(inst.startDate);
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + inst.paidMonths);

                const daysUntil = Math.ceil((nextPaymentDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                const dueText = daysUntil < 0 ? 'Overdue' : daysUntil === 0 ? 'Today' : `${daysUntil} days`;

                return {
                    id: inst.id,
                    name: inst.name,
                    amount: monthlyAmount.toFixed(2),
                    due: dueText,
                    daysUntil
                };
            })
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .slice(0, 3);
    }, [installments]);

    if (isLoading) {
        return <Card className="p-6 h-[200px] animate-pulse bg-slate-50" />;
    }

    if (!upcomingPayments || upcomingPayments.length === 0) {
        return (
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <h3 className="font-semibold text-slate-900">Upcoming Payments</h3>
                    </div>
                </div>
                <p className="text-sm text-slate-500 text-center py-8">No upcoming installment payments</p>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h3 className="font-semibold text-slate-900">Upcoming Payments</h3>
                </div>
            </div>
            <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/30">
                        <div>
                            <p className="font-medium text-sm text-slate-900">{payment.name}</p>
                            <p className="text-xs text-slate-500">Due in {payment.due}</p>
                        </div>
                        <span className="font-semibold text-sm text-slate-900">${payment.amount}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
}
