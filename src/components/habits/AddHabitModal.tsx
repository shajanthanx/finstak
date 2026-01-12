"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Habit } from '@/types';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (habit: Partial<Habit>) => Promise<void>;
}

export function AddHabitModal({ isOpen, onClose, onSave }: AddHabitModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('📝'); // Default icon
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsLoading(true);
        try {
            await onSave({
                title,
                description,
                icon,
                frequency: 'daily',
                goalTarget: 1,
                startDate: new Date().toISOString().split('T')[0] // Start today
            });
            // Reset and close
            setTitle('');
            setDescription('');
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Habit">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Habit Title</label>
                    <Input
                        placeholder="e.g., Drink Water"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                    <Input
                        placeholder="e.g., 8 glasses a day"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Icon</label>
                    <div className="flex gap-2">
                        {['📝', '💧', '🏃', '📚', '🧘', '💰', '💊', '🥗'].map(emoji => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setIcon(emoji)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg text-xl border transition-all ${icon === emoji
                                        ? 'bg-blue-50 border-blue-500 scale-110'
                                        : 'bg-white border-slate-200 hover:bg-slate-50'
                                    }`}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                    <Button type="submit" isLoading={isLoading}>Create Habit</Button>
                </div>
            </form>
        </Modal>
    );
}
