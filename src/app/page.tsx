"use client";

import { KPIStats } from "@/components/dashboard/KPIStats";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { SpendingPieChart } from "@/components/dashboard/SpendingPieChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetStatus } from "@/components/dashboard/BudgetStatus";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";
import { TasksOverview } from "@/components/dashboard/TasksOverview";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-fade-in text-center p-8">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <span className="text-3xl">🏠</span>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">Welcome to FinStack</h1>
      <p className="text-slate-500 max-w-sm">
        All financial analytics and dashboard components have been moved to the <br />
        <a href="/analytics" className="text-slate-900 font-medium hover:underline">Analytics section</a> under Finance.
      </p>
    </div>
  );
}
