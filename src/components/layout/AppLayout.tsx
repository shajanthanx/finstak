"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import QueryProvider from "@/providers/QueryProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    
    // Don't show AppLayout on auth pages
    const isAuthPage = pathname?.startsWith('/auth');
    
    // Redirect authenticated users away from auth pages
    // But only after auth check is complete
    useEffect(() => {
        // Don't redirect during initial loading
        if (loading) {
            return; // Wait for auth check to complete
        }
        
        if (user && isAuthPage) {
            router.push('/');
        }
    }, [user, loading, isAuthPage, router]);
    
    // Show loading state while checking auth (only on protected pages)
    if (!isAuthPage && loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-900" />
                    <p className="text-sm text-slate-600">Loading...</p>
                </div>
            </div>
        );
    }
    
    if (isAuthPage) {
        return <>{children}</>;
    }

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
