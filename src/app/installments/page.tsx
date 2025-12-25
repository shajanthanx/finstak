"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Layers, DollarSign, Calendar, ShoppingBag, Clock } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Installment } from "@/types";
import { getInstallmentCategories, INSTALLMENT_CATEGORIES } from "@/config/categories";

export default function InstallmentsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlan, setNewPlan] = useState<Partial<Installment>>({
        name: '',
        totalAmount: 0,
        paidAmount: 0,
        totalMonths: 12,
        provider: '',
        category: getInstallmentCategories()[0] || 'Tech'
    });

    const { data: installments, isLoading } = useQuery({
        queryKey: ['installments'],
        queryFn: api.getInstallments
    });

    const createMutation = useMutation({
        mutationFn: api.createInstallment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['installments'] });
            setIsModalOpen(false);
            setNewPlan({ name: '', totalAmount: 0, paidAmount: 0, totalMonths: 12, provider: '', category: getInstallmentCategories()[0] || 'Tech' });
        }
    });

    const totalActive = installments?.length || 0;
    const totalDebt = installments?.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0) || 0;
    const monthlyCommitment = installments?.reduce((acc, curr) => acc + (curr.totalAmount / curr.totalMonths), 0) || 0;

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            ...newPlan,
            id: Date.now(),
            totalAmount: Number(newPlan.totalAmount),
            paidAmount: Number(newPlan.paidAmount),
            totalMonths: Number(newPlan.totalMonths),
            paidMonths: 0,
            startDate: new Date().toISOString().split('T')[0]
        } as Installment);
    };

    if (isLoading) return <div className="p-8 animate-pulse">Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header & Actions */}
            {/* Actions */}
            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Plan
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Active Plans</p>
                            <h3 className="text-2xl font-bold text-slate-900">{totalActive}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Total Outstanding</p>
                            <h3 className="text-2xl font-bold text-slate-900">${totalDebt.toLocaleString()}</h3>
                        </div>
                    </div>
                </Card>
                <Card className="p-6">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Monthly Bill</p>
                            <h3 className="text-2xl font-bold text-slate-900">${monthlyCommitment.toFixed(2)}</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Installment Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {installments?.map(plan => {
                    const progress = (plan.paidAmount / plan.totalAmount) * 100;
                    const monthlyPayment = plan.totalAmount / plan.totalMonths;
                    const remainingMonths = plan.totalMonths - plan.paidMonths;

                    return (
                        <Card key={plan.id} className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                                        <ShoppingBag className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{plan.name}</h3>
                                        <p className="text-xs text-slate-500">{plan.provider} • {plan.category}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-slate-900">${plan.totalAmount.toLocaleString()}</span>
                                    <span className="text-xs text-slate-500">Total</span>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-slate-700">Progress</span>
                                    <span className="text-slate-900">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                    <span>Paid: ${plan.paidAmount.toLocaleString()}</span>
                                    <span>Remaining: ${(plan.totalAmount - plan.paidAmount).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <div className="flex items-center text-sm">
                                    <Clock className="w-4 h-4 text-slate-400 mr-2" />
                                    <span className="font-medium text-slate-700">{remainingMonths} months left</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-sm font-bold text-slate-900">${monthlyPayment.toFixed(2)} / mo</span>
                                </div>
                            </div>
                        </Card>
                    )
                })}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Installment Plan">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Item Name</label>
                        <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" placeholder="e.g. iPhone 15" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Provider</label>
                            <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" placeholder="e.g. Equipment Financing" value={newPlan.provider} onChange={e => setNewPlan({ ...newPlan, provider: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" value={newPlan.category} onChange={e => setNewPlan({ ...newPlan, category: e.target.value })}>
                                {INSTALLMENT_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Total Amount</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input required type="number" className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" placeholder="0.00" value={newPlan.totalAmount} onChange={e => setNewPlan({ ...newPlan, totalAmount: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Duration (Months)</label>
                            <select className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900" value={newPlan.totalMonths} onChange={e => setNewPlan({ ...newPlan, totalMonths: Number(e.target.value) })}>
                                <option value="3">3 Months</option>
                                <option value="6">6 Months</option>
                                <option value="12">12 Months</option>
                                <option value="18">18 Months</option>
                                <option value="24">24 Months</option>
                                <option value="36">36 Months</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all">Add Plan</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
