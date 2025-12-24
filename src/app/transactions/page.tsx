"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Plus, Trash2, Wallet, ArrowUpCircle, ArrowDownCircle, Calendar, Tag } from "lucide-react";
import { useState } from "react";
import { Transaction } from "@/types";

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    const [newTx, setNewTx] = useState<Partial<Transaction>>({
        name: '',
        amount: '' as unknown as number,
        category: 'Food',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
    });

    const { data: transactions, isLoading } = useQuery({
        queryKey: ['transactions'],
        queryFn: api.getTransactions
    });

    const createMutation = useMutation({
        mutationFn: api.createTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            setNewTx(prev => ({
                name: '',
                amount: '' as unknown as number,
                category: 'Food',
                type: prev.type,
                date: new Date().toISOString().split('T')[0]
            }));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: api.deleteTransaction,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
        }
    });

    const filteredTransactions = transactions?.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || t.type === typeFilter;
        return matchesSearch && matchesType;
    }) || [];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTx.name || !newTx.amount) return;

        createMutation.mutate({
            ...newTx,
            id: Date.now(),
            amount: Number(newTx.amount),
            icon: newTx.type === 'income' ? '💰' : '💳'
        } as Transaction);
    };

    if (isLoading) return <div className="p-8 animate-pulse">Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto">
            {/* Quick Add Toolbar - Horizontal Layout */}
            <Card className="p-1 border-slate-200 shadow-sm overflow-visible bg-white relative z-10">
                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 p-2">

                    {/* 1. Type Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                        <button
                            type="button"
                            onClick={() => setNewTx({ ...newTx, type: 'expense' })}
                            className={`flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${newTx.type === 'expense'
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setNewTx({ ...newTx, type: 'income' })}
                            className={`flex items-center px-3 py-2 rounded-md text-xs font-bold transition-all ${newTx.type === 'income'
                                    ? 'bg-white text-emerald-600 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Income
                        </button>
                    </div>

                    <div className="w-px h-8 bg-slate-200 mx-2 hidden xl:block"></div>

                    {/* 2. Date & Category Group */}
                    <div className="flex gap-2 shrink-0">
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <input
                                type="date"
                                required
                                className="pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 w-full xl:w-auto"
                                value={newTx.date}
                                onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 appearance-none cursor-pointer w-full xl:w-40"
                                value={newTx.category}
                                onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                            >
                                <option>Food</option>
                                <option>Transport</option>
                                <option>Entertainment</option>
                                <option>Utilities</option>
                                <option>Shopping</option>
                                <option>Housing</option>
                                <option>Income</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    {/* 3. Description (Flex Grow) */}
                    <input
                        type="text"
                        required
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 placeholder:text-slate-400"
                        placeholder="Description (e.g. Grocery Shopping)"
                        value={newTx.name}
                        onChange={(e) => setNewTx({ ...newTx, name: e.target.value })}
                    />

                    {/* 4. Amount */}
                    <div className="relative shrink-0 w-full xl:w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                        <input
                            type="number"
                            step="0.01"
                            required
                            className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 placeholder:font-normal"
                            placeholder="0.00"
                            value={newTx.amount === 0 ? '' : newTx.amount}
                            onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                        />
                    </div>

                    {/* 5. Submit Button */}
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                    >
                        {createMutation.isPending ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" /> Add
                            </>
                        )}
                    </button>
                </form>
            </Card>

            {/* List Header & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                    <Wallet className="w-5 h-5 mr-2 text-slate-500" />
                    Transaction History
                </h2>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 w-full sm:w-48 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 appearance-none cursor-pointer text-slate-700"
                        >
                            <option value="all">All</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transaction List Table */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Transaction</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mr-4 text-xl group-hover:bg-white group-hover:shadow-md transition-all border border-transparent group-hover:border-slate-200">
                                                    {t.icon}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-900">{t.name}</p>
                                                    <p className="text-xs text-slate-500 xl:hidden">{t.date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">{t.date}</td>
                                        <td className={`px-6 py-4 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                            {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => deleteMutation.mutate(t.id)}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Transaction"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-slate-50 p-4 rounded-full mb-3">
                                                <Search className="w-6 h-6 opacity-20" />
                                            </div>
                                            <p>No transactions found matching your criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
