"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Home,
    DollarSign,
    Users,
    PieChart,
    Wallet,
    Target,
    Layers,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    ListTodo,
    PanelLeftClose,
    PanelLeftOpen,
    LogOut,
    Settings,
    type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NavItem {
    href?: string;
    icon: LucideIcon;
    label: string;
    children?: NavItem[];
}

const navItems: NavItem[] = [
    {
        href: "/",
        icon: Home,
        label: "Home"
    },
    {
        icon: DollarSign,
        label: "Finance",
        children: [
            { href: "/analytics", icon: PieChart, label: "Analytics" },
            { href: "/transactions", icon: Wallet, label: "Transactions" },
            { href: "/budget", icon: Target, label: "Budget" },
            { href: "/installments", icon: Layers, label: "Installments" },
            { href: "/setup", icon: Settings, label: "Setup" },
        ]
    },
    {
        icon: Users,
        label: "Life Management",
        children: [
            { href: "/tasks", icon: ListTodo, label: "Tasks" },
        ]
    }
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Close user menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setUserMenuOpen(false);
            }
        }

        if (userMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [userMenuOpen]);

    // Get user name from metadata
    const getUserName = () => {
        if (user?.user_metadata?.full_name) {
            return user.user_metadata.full_name;
        }
        if (user?.user_metadata?.name) {
            return user.user_metadata.name;
        }
        if (user?.email) {
            // Fallback to email if no name
            return user.email.split('@')[0];
        }
        return "User";
    };

    // Get user email
    const getUserEmail = () => {
        return user?.email || "";
    };

    // Get user initials from name
    const getUserInitials = () => {
        const name = getUserName();
        if (name && name !== "User") {
            const parts = name.trim().split(' ');
            if (parts.length >= 2) {
                return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
            }
            return name.substring(0, 2).toUpperCase();
        }
        return "U";
    };

    const handleSignOut = async () => {
        await signOut();
        setUserMenuOpen(false);
    };

    // Auto-expand parent module when navigating to a child page
    useEffect(() => {
        navItems.forEach((item) => {
            if (item.children) {
                const hasActiveChild = item.children.some(child => child.href === pathname);
                if (hasActiveChild) {
                    setExpandedModules(prev => new Set(prev).add(item.label));
                }
            }
        });
    }, [pathname]);

    const toggleModule = (label: string) => {
        setExpandedModules(prev => {
            const newSet = new Set(prev);
            if (newSet.has(label)) {
                newSet.delete(label);
            } else {
                newSet.add(label);
            }
            return newSet;
        });
    };

    const isParentActive = (item: NavItem) => {
        if (!item.children) return false;
        return item.children.some(child => child.href === pathname);
    };

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
                "fixed inset-y-0 left-0 z-50 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full",
                isCollapsed ? "md:w-20" : "md:w-64 w-64"
            )}>
                {/* Floating Toggle Button - Desktop Only */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-12 z-50 items-center justify-center w-6 h-6 bg-white border border-slate-200 rounded-full shadow-sm text-slate-500 hover:text-slate-900 transition-all hover:scale-110"
                >
                    {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronLeft className="w-3.5 h-3.5" />
                    )}
                </button>

                <div className="h-full flex flex-col overflow-hidden">
                    {/* Logo */}
                    <div className={cn(
                        "h-16 flex items-center border-b border-slate-100 transition-all duration-300",
                        isCollapsed ? "px-4 justify-center" : "px-6"
                    )}>
                        <div className="flex items-center overflow-hidden">
                            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-lg">F</span>
                            </div>
                            {!isCollapsed && (
                                <span className="ml-3 font-semibold text-lg tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">
                                    FinStack
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const hasChildren = item.children && item.children.length > 0;
                            const isExpanded = expandedModules.has(item.label);
                            const isActive = pathname === item.href;
                            const parentActive = isParentActive(item);

                            return (
                                <div key={item.label}>
                                    {/* Parent Item */}
                                    {item.href ? (
                                        // Simple link (no children)
                                        <Link
                                            href={item.href}
                                            onClick={() => onClose()}
                                            className={cn(
                                                "w-full flex items-center rounded-lg text-sm font-medium transition-all duration-300",
                                                isActive
                                                    ? "bg-slate-900 text-white"
                                                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                                                isCollapsed ? "px-0 justify-center h-10 w-10 mx-auto" : "px-3 py-2.5"
                                            )}
                                            title={isCollapsed ? item.label : ""}
                                        >
                                            <item.icon className={cn("w-4 h-4 flex-shrink-0", !isCollapsed && "mr-3")} />
                                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                                        </Link>
                                    ) : (
                                        // Parent with children
                                        <button
                                            onClick={() => toggleModule(item.label)}
                                            className={cn(
                                                "w-full flex items-center rounded-lg text-sm font-semibold transition-all duration-300",
                                                parentActive
                                                    ? "bg-slate-100 text-slate-900"
                                                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900",
                                                isCollapsed ? "px-0 justify-center h-10 w-10 mx-auto" : "px-3 py-2.5"
                                            )}
                                            title={isCollapsed ? item.label : ""}
                                        >
                                            <item.icon className={cn("w-4 h-4 flex-shrink-0", !isCollapsed && "mr-3")} />
                                            {!isCollapsed && (
                                                <>
                                                    <span className="flex-1 text-left truncate">{item.label}</span>
                                                    {hasChildren && (
                                                        isExpanded ? (
                                                            <ChevronDown className="w-4 h-4 flex-shrink-0" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 flex-shrink-0" />
                                                        )
                                                    )}
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {/* Children Items */}
                                    {hasChildren && isExpanded && !isCollapsed && (
                                        <div className="mt-1 ml-4 pl-4 border-l-2 border-slate-200 space-y-1">
                                            {item.children!.map((child) => {
                                                const childActive = pathname === child.href;
                                                return (
                                                    <Link
                                                        key={child.href}
                                                        href={child.href!}
                                                        onClick={() => onClose()}
                                                        className={cn(
                                                            "w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                            childActive
                                                                ? "bg-slate-900 text-white"
                                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                                        )}
                                                    >
                                                        <child.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                                                        {child.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </nav>

                    {/* User Profile Snippet */}
                    {user && (
                        <div className={cn(
                            "p-4 border-t border-slate-100 transition-all duration-300 relative",
                            isCollapsed ? "flex justify-center" : "px-4"
                        )} ref={userMenuRef}>
                            {!isCollapsed ? (
                                <>
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="w-full flex items-center gap-3 rounded-lg hover:bg-slate-50 transition-colors p-2 -m-2"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-sm flex-shrink-0">
                                            {getUserInitials()}
                                        </div>
                                        <div className="flex-1 min-w-0 text-left">
                                            <p className="text-sm font-medium text-slate-900 truncate">{getUserName()}</p>
                                            <p className="text-xs text-slate-500 truncate">{getUserEmail()}</p>
                                        </div>
                                        <ChevronDown className={cn(
                                            "w-4 h-4 text-slate-400 transition-transform flex-shrink-0",
                                            userMenuOpen && "rotate-180"
                                        )} />
                                    </button>

                                    {/* User Menu Dropdown */}
                                    {userMenuOpen && (
                                        <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign out
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-medium text-sm"
                                    title={getUserName()}
                                >
                                    {getUserInitials()}
                                </button>
                            )}

                            {/* User Menu Dropdown for Collapsed Sidebar */}
                            {isCollapsed && userMenuOpen && (
                                <div className="absolute bottom-full left-4 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 min-w-[200px]">
                                    <div className="px-4 py-2 border-b border-slate-100">
                                        <p className="text-sm font-medium text-slate-900 truncate">{getUserName()}</p>
                                        <p className="text-xs text-slate-500 truncate">{getUserEmail()}</p>
                                    </div>
                                    <button
                                        onClick={handleSignOut}
                                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
