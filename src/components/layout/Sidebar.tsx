"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    PieChart,
    Wallet,
    Target,
    CreditCard,
    Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navItems = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/analytics", icon: PieChart, label: "Analytics" },
    { href: "/transactions", icon: Wallet, label: "Transactions" },
    { href: "/budget", icon: Target, label: "Budgeting" },
    { href: "/cards", icon: CreditCard, label: "Cards" },
    { href: "/installments", icon: Layers, label: "Installments" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-100">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-lg">F</span>
                        </div>
                        <span className="font-semibold text-lg tracking-tight">FinStack</span>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => onClose()} // Close sidebar on mobile nav
                                    className={cn(
                                        "w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-slate-100 text-slate-900"
                                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    <item.icon className="w-4 h-4 mr-3" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile Snippet */}
                    <div className="p-4 border-t border-slate-100">
                        <div className="flex items-center">
                            <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm">
                                JD
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium">John Doe</p>
                                <p className="text-xs text-slate-500">Pro Plan</p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
