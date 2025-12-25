"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { categoryService } from "@/services/categories";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Plus, Trash2, Wallet, Calendar, Tag, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Transaction, Category } from "@/types";
import { SetupBanner } from "@/components/setup/SetupBanner";

export default function TransactionsPage() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');

    // Fetch dynamic categories
    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: categoryService.getAll
    });

    const expenseCategories = useMemo(() =>
        categories?.filter(c => c.type === 'expense') || [],
        [categories]);

    const incomeCategories = useMemo(() =>
        categories?.filter(c => c.type === 'income') || [],
        [categories]);

    const [newTx, setNewTx] = useState<Partial<Transaction>>({
        name: '',
        amount: '' as unknown as number,
        category: '',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
    });

    // Update default category when categories are loaded
    useMemo(() => {
        if (!newTx.category && categories && categories.length > 0) {
            const defaultCat = newTx.type === 'income'
                ? incomeCategories[0]?.name
                : expenseCategories[0]?.name;
            if (defaultCat) {
                setNewTx(prev => ({ ...prev, category: defaultCat }));
            }
        }
    }, [categories, newTx.type, incomeCategories, expenseCategories]);

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
                category: prev.type === 'income'
                    ? incomeCategories[0]?.name || ''
                    : expenseCategories[0]?.name || '',
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
        if (!newTx.name || !newTx.amount || !newTx.category) return;

        const categoryObj = categories?.find(c => c.name === newTx.category);

        createMutation.mutate({
            ...newTx,
            id: Date.now(),
            amount: Number(newTx.amount),
            icon: categoryObj?.icon || '📦'
        } as Transaction);
    };

    if (isLoading || isCategoriesLoading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                <p className="text-sm text-slate-500 font-medium">Synchronizing transactions...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-[1600px] mx-auto pb-12">
            <SetupBanner />

            {/* Quick Add Toolbar */}
            <Card className="p-1 border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-visible bg-white relative z-10 transition-all">
                <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row items-stretch xl:items-center gap-2 p-2">

                    {/* 1. Type Toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
                        <button
                            type="button"
                            onClick={() => setNewTx({ ...newTx, type: 'expense', category: expenseCategories[0]?.name || '' })}
                            className={`flex items-center px-4 py-2 rounded-md text-xs font-bold transition-all ${newTx.type === 'expense'
                                ? 'bg-white text-slate-900 shadow-sm scale-[1.02]'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Expense
                        </button>
                        <button
                            type="button"
                            onClick={() => setNewTx({ ...newTx, type: 'income', category: incomeCategories[0]?.name || '' })}
                            className={`flex items-center px-4 py-2 rounded-md text-xs font-bold transition-all ${newTx.type === 'income'
                                ? 'bg-white text-emerald-600 shadow-sm scale-[1.02]'
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
                                className="pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 w-full xl:w-auto"
                                value={newTx.date}
                                onChange={(e) => setNewTx({ ...newTx, date: e.target.value })}
                            />
                        </div>

                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            <select
                                className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 appearance-none cursor-pointer w-full xl:w-48"
                                value={newTx.category}
                                required
                                onChange={(e) => setNewTx({ ...newTx, category: e.target.value })}
                            >
                                <option value="" disabled>Select Category</option>
                                {newTx.type === 'income'
                                    ? incomeCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))
                                    : expenseCategories.map(cat => (
                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>

                    {/* 3. Description */}
                    <input
                        type="text"
                        required
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300"
                        placeholder="Description (e.g. Netflix Subscription)"
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
                            className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 placeholder:font-normal"
                            placeholder="0.00"
                            value={newTx.amount === 0 ? '' : newTx.amount}
                            onChange={(e) => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                        />
                    </div>

                    {/* 5. Submit Button */}
                    <button
                        type="submit"
                        disabled={createMutation.isPending || (newTx.type === 'income' ? incomeCategories.length === 0 : expenseCategories.length === 0)}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                    >
                        {createMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" /> Add
                            </>
                        )}
                    </button>
                </form>
            </Card>

            {/* List Header & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg shadow-slate-900/10">
                        <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Transaction History</h2>
                        <p className="text-xs text-slate-500 font-medium">Monitoring your financial signals</p>
                    </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2.5 w-full sm:w-60 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 transition-all"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-950/5 focus:border-slate-300 appearance-none cursor-pointer text-slate-700 font-medium"
                        >
                            <option value="all">All Flows</option>
                            <option value="income">Inflow</option>
                            <option value="expense">Outflow</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Transaction List */}
            <Card className="overflow-hidden border-slate-200/60 shadow-xl shadow-slate-200/10 rounded-2xl bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-100">
                            <tr>
                                <th className="px-8 py-5">Entity</th>
                                <th className="px-6 py-5">Classification</th>
                                <th className="px-6 py-5">Timestamp</th>
                                <th className="px-6 py-5 text-right">Value</th>
                                <th className="px-8 py-5 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredTransactions.length > 0 ? (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center">
                                                <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center mr-4 text-xl shadow-inner border border-slate-100 transition-all group-hover:bg-white group-hover:scale-105 group-hover:shadow-md">
                                                    {t.icon}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{t.name}</p>
                                                    <p className="text-[10px] uppercase font-bold text-slate-400 xl:hidden mt-0.5">{t.date}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex">
                                                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-100/80 text-slate-500 border border-slate-200/50 group-hover:border-slate-300 transition-colors">
                                                    {t.category}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-slate-500 font-semibold">{t.date}</td>
                                        <td className={`px-6 py-5 text-right font-bold text-base ${t.type === 'income' ? 'text-emerald-500' : 'text-slate-900'}`}>
                                            {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => deleteMutation.mutate(t.id)}
                                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                                title="Remove Transaction"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 border border-slate-100">
                                                <Search className="w-7 h-7 text-slate-200" />
                                            </div>
                                            <h3 className="text-slate-900 font-bold text-base">No Data Points Detected</h3>
                                            <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                                                Your current filters show no recorded activity. Try adjusting your search or add a new transaction.
                                            </p>
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
