"use client";

import { useState } from "react";
import { Settings as SettingsIcon, Layers, Landmark, CreditCard, Shield, Users, Bell, Globe } from "lucide-react";
import { TaskCategoriesSettings } from "@/components/setup/TaskCategoriesSettings";
import { FinanceCategoriesSettings } from "@/components/setup/FinanceCategoriesSettings";

type SetupSection = 'task-categories' | 'finance-categories' | 'general' | 'notifications' | 'billing';

export default function SetupPage() {
    const [activeSection, setActiveSection] = useState<SetupSection>('task-categories');

    // Sidebar Items Configuration
    const sidebarItems = [
        {
            title: "Workspace",
            items: [
                { id: 'task-categories', label: 'Task Categories', icon: Layers },
                { id: 'finance-categories', label: 'Finance Categories', icon: Landmark },
            ]
        }
    ];

    return (
        <div className="flex h-full bg-slate-50 font-sans text-slate-900">
            {/* Setup Sidebar */}
            <aside className="w-[280px] bg-white border-r border-slate-200 flex flex-col pt-8 pb-6 flex-shrink-0">
                <nav className="flex-1 px-4 space-y-8 overflow-y-auto">
                    {sidebarItems.map((group, groupIndex) => (
                        <div key={groupIndex}>
                            <h3 className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                {group.title}
                            </h3>
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeSection === item.id;

                                    // Visual trick: When active, simple gray background or subtle theme color
                                    // The provided image shows a very clean look, likely gray background for active.
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => setActiveSection(item.id as SetupSection)}
                                            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out group ${isActive
                                                ? "bg-slate-100 text-slate-900"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                                }`}
                                        >
                                            <Icon
                                                className={`w-4 h-4 mr-3 transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"
                                                    }`}
                                                strokeWidth={2}
                                            />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Action (e.g., Delete Account) mock */}
                <div className="px-4 mt-auto">
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md w-full transition-colors">
                        <Shield className="w-4 h-4 mr-3" />
                        Sign out of all devices
                    </button>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-[1200px] mx-auto p-8">
                    {activeSection === 'task-categories' && <TaskCategoriesSettings />}
                    {activeSection === 'finance-categories' && <FinanceCategoriesSettings />}

                    {/* Placeholder for other sections */}
                    {['general', 'notifications', 'billing', 'security', 'members'].includes(activeSection) && !['task-categories', 'finance-categories'].includes(activeSection) && (
                        <div className="w-full h-96 flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <SettingsIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900">Coming Soon</h2>
                            <p className="text-sm text-slate-500 mt-1">This setting module is currently under development.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
