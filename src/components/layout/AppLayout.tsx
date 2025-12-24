"use client";

import React, { useState } from "react";
import QueryProvider from "@/providers/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <QueryProvider>
            <div className="flex h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200">
                <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                <main className="flex-1 flex flex-col h-screen overflow-hidden">
                    <Header onMenuClick={() => setSidebarOpen(true)} />
                    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </QueryProvider>
    );
}
