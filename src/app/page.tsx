"use client";

import { KPIStats } from "@/components/dashboard/KPIStats";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { SpendingPieChart } from "@/components/dashboard/SpendingPieChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetStatus } from "@/components/dashboard/BudgetStatus";
import { UpcomingBills } from "@/components/dashboard/UpcomingBills";

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Grid */}
      <KPIStats />

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CashFlowChart />
        <SpendingPieChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactions />
        <div className="space-y-6">
          <BudgetStatus />
          <UpcomingBills />
        </div>
      </div>
    </div>
  );
}
