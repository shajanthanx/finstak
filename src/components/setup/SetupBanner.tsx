"use client";

import { useQuery } from "@tanstack/react-query";
import { setupService } from "@/services/setup";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

/**
 * Banner component that shows when finance system needs initialization
 * Simplified to show only if categories are 0
 */
export function SetupBanner() {
    const [dismissed, setDismissed] = useState(false);

    const { data: status } = useQuery({
        queryKey: ['setupStatus'],
        queryFn: setupService.checkStatus,
        refetchOnWindowFocus: false,
    });

    // Don't show if dismissed or already initialized
    if (dismissed || status?.initialized) {
        return null;
    }

    return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg animate-fade-in shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 mb-1">
                            Finance Setup Required
                        </h3>
                        <p className="text-sm text-amber-800 mb-3">
                            Initialize your account by creating at least one financial category to track your spending and income.
                        </p>
                        <Link
                            href="/setup"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-all hover:shadow-md active:scale-95"
                        >
                            Complete Setup
                        </Link>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-amber-400 hover:text-amber-600 transition-colors shrink-0 p-1 hover:bg-amber-100 rounded-full"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
