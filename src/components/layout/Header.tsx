"use client";

import React from "react";
import { Menu, Search, Bell } from "lucide-react";
import { usePathname } from "next/navigation";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();

    const getTitle = () => {
        switch (pathname) {
            case '/': return 'Dashboard';
            case '/analytics': return 'Analytics';
            case '/transactions': return 'Transactions';
            case '/budget': return 'Budgeting';
            case '/cards': return 'My Cards';
            case '/installments': return 'Installments';
            default: return 'Dashboard';
        }
    };

    return (
        <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white/50 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10">
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 mr-2 rounded-md hover:bg-slate-100 md:hidden"
                >
                    <Menu className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex items-center text-sm font-medium">
                    <span className="text-slate-400">Home</span>
                    <span className="mx-2 text-slate-300">/</span>
                    <span className="text-slate-900">{getTitle()}</span>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <div className="hidden md:flex relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-300 transition-all placeholder:text-slate-400"
                    />
                </div>
                <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                </button>
            </div>
        </header>
    );
}
