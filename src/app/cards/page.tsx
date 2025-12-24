"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Wifi, Cpu, EyeOff, Lock, Trash2 } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Card as CardType } from "@/types";

export default function CardsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [revealedPins, setRevealedPins] = useState<Record<number, boolean>>({});
    const [newCard, setNewCard] = useState<Partial<CardType>>({
        bankName: '',
        holder: '',
        balance: 0,
        limit: 0,
        type: 'debit',
        number: '',
        expiry: '',
        pin: '',
        color: 'bg-slate-900'
    });

    const { data: cards, isLoading } = useQuery({
        queryKey: ['cards'],
        queryFn: api.getCards
    });

    const createMutation = useMutation({
        mutationFn: api.createCard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
            setIsModalOpen(false);
            setNewCard({
                bankName: '', holder: '', balance: 0, limit: 0, type: 'debit', number: '', expiry: '', pin: '', color: 'bg-slate-900'
            });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: api.deleteCard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cards'] });
        }
    });

    const togglePin = (id: number) => {
        setRevealedPins(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAddSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({
            ...newCard,
            id: Date.now(),
            balance: Number(newCard.balance) || 0,
            limit: newCard.type === 'credit' ? Number(newCard.limit) : undefined,
            number: newCard.number?.slice(-4) || '0000',
            isFrozen: false
        } as CardType);
    };

    if (isLoading) return <div className="p-8 animate-pulse">Loading...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-end">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                >
                    <Plus className="w-4 h-4 mr-2" /> Add Card
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {cards?.map(card => {
                    const isCredit = card.type === 'credit';
                    const utilization = isCredit && card.limit ? (card.balance / card.limit) * 100 : 0;
                    const available = isCredit && card.limit ? card.limit - card.balance : card.balance;

                    return (
                        <div key={card.id} className="group relative flex flex-col h-full">
                            {/* Visual Card - Fixed Ratio, Robust Flex Layout */}
                            <div className={`relative w-full aspect-[1.586/1] rounded-2xl p-5 text-white shadow-xl ${card.color} flex flex-col justify-between overflow-hidden transition-transform duration-300 hover:scale-[1.02]`}>

                                {/* Background Decor */}
                                <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                                <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>

                                {/* Top Row: Bank & Type */}
                                <div className="flex justify-between items-start z-10">
                                    <div>
                                        <h3 className="font-bold tracking-wider text-sm opacity-90">{card.bankName}</h3>
                                        <p className="text-[10px] opacity-70 uppercase tracking-widest mt-0.5">{card.type} Card</p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <Wifi className="w-6 h-6 rotate-90 opacity-70" />
                                        <span className="font-bold italic text-lg opacity-90">{isCredit ? 'VISA' : 'Debit'}</span>
                                    </div>
                                </div>

                                {/* Middle Row: Chip & Number */}
                                <div className="z-10 flex flex-col justify-center flex-1 py-1">
                                    <div className="mb-2">
                                        <Cpu className="w-9 h-9 text-yellow-200/80" strokeWidth={1.5} />
                                    </div>
                                    <div className="font-mono text-lg xl:text-xl tracking-widest flex items-center space-x-2">
                                        <span className="opacity-60 text-sm align-middle">•••• •••• ••••</span>
                                        <span>{card.number}</span>
                                    </div>
                                </div>

                                {/* Bottom Row: Holder & Expiry */}
                                <div className="flex justify-between items-end z-10 pb-1">
                                    <div>
                                        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Card Holder</p>
                                        <p className="font-medium tracking-wide text-sm truncate max-w-[120px]">{card.holder.toUpperCase()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] uppercase tracking-widest opacity-60 mb-0.5">Expires</p>
                                        <p className="font-medium tracking-wide text-sm">{card.expiry}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Details & Controls - Flex Grow to Fill Height */}
                            <Card className="mt-4 p-5 flex-1 flex flex-col">
                                <div className="space-y-4 flex-1">

                                    {/* Balances */}
                                    <div className="flex justify-between items-end pb-4 border-b border-slate-100">
                                        <div>
                                            <p className="text-xs text-slate-500 mb-1">{isCredit ? 'Current Balance' : 'Available Balance'}</p>
                                            <h4 className="text-2xl font-bold text-slate-900">${card.balance.toLocaleString()}</h4>
                                        </div>
                                        {isCredit && (
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 mb-1">Available Credit</p>
                                                <p className="text-sm font-semibold text-emerald-600">${available.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Credit Utilization Bar (Only for Credit Cards) */}
                                    {isCredit && card.limit && (
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-500">Credit Limit: ${card.limit.toLocaleString()}</span>
                                                <span className={`${utilization > 80 ? 'text-rose-500' : 'text-slate-500'}`}>{utilization.toFixed(0)}% Used</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${utilization > 80 ? 'bg-rose-500' : 'bg-slate-800'}`}
                                                    style={{ width: `${Math.min(utilization, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions Grid - Pushed to bottom with mt-auto */}
                                    <div className="mt-auto space-y-3 pt-2">
                                        <button
                                            onClick={() => togglePin(card.id)}
                                            className="w-full flex items-center justify-center p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors group/btn"
                                        >
                                            {revealedPins[card.id] ? (
                                                <>
                                                    <span className="text-lg font-bold text-slate-900 mr-2">{card.pin}</span>
                                                    <span className="text-xs text-slate-500 flex items-center"><EyeOff className="w-3 h-3 mr-1" /> Hide</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock className="w-4 h-4 text-slate-500 mr-2" />
                                                    <span className="text-xs font-medium text-slate-600">View PIN</span>
                                                </>
                                            )}
                                        </button>

                                        <button
                                            onClick={() => deleteMutation.mutate(card.id)}
                                            className="w-full flex items-center justify-center py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3 mr-1.5" /> Remove Card
                                        </button>
                                    </div>

                                </div>
                            </Card>
                        </div>
                    );
                })}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Add New Card"
            >
                <form onSubmit={handleAddSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Card Type</label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setNewCard({ ...newCard, type: 'debit', color: 'bg-slate-900' })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${newCard.type === 'debit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                            >Debit</button>
                            <button
                                type="button"
                                onClick={() => setNewCard({ ...newCard, type: 'credit', color: 'bg-zinc-600' })}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${newCard.type === 'credit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
                            >Credit</button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Bank Name</label>
                        <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="e.g. Chase Sapphire" value={newCard.bankName} onChange={e => setNewCard({ ...newCard, bankName: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Card Holder Name</label>
                        <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="JOHN DOE" value={newCard.holder} onChange={e => setNewCard({ ...newCard, holder: e.target.value })} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Last 4 Digits</label>
                            <input required maxLength={4} type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="4242" value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Expiry Date</label>
                            <input required type="text" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="MM/YY" value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">{newCard.type === 'credit' ? 'Current Balance (Owed)' : 'Current Balance'}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                <input required type="number" className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="0.00" value={newCard.balance} onChange={e => setNewCard({ ...newCard, balance: Number(e.target.value) })} />
                            </div>
                        </div>
                        {newCard.type === 'credit' && (
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">Credit Limit</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                    <input required type="number" className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" placeholder="5000" value={newCard.limit} onChange={e => setNewCard({ ...newCard, limit: Number(e.target.value) })} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">PIN Number</label>
                        <input type="text" maxLength={4} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm tracking-widest" placeholder="1234" value={newCard.pin} onChange={e => setNewCard({ ...newCard, pin: e.target.value })} />
                    </div>

                    <div className="pt-2">
                        <button type="submit" className="w-full py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-all">Save Card</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
