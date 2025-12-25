"use client";

import { useQuery } from "@tanstack/react-query";
import { setupService } from "@/services/setup";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

/**
 * Banner component that shows when finance system needs initialization
 * Can be added to finance pages to prompt users to complete setup
 */
export function SetupBanner() {
    const [dismissed, setDismissed] = useState(false);
    
    const { data: status } = useQuery({
        queryKey: ['setupStatus'],
        queryFn: setupService.checkStatus,
        refetchOnWindowFocus: false,
    });

    if (dismissed || status?.initialized) {
        return null;
    }

    const missingCount = status?.missingCategories?.length || 0;

    if (missingCount === 0) {
        return null;
    }

    return (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-lg animate-fade-in">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-amber-900 mb-1">
                            Finance Setup Required
                        </h3>
                        <p className="text-sm text-amber-800 mb-2">
                            {missingCount} budget categor{missingCount === 1 ? 'y' : 'ies'} need to be initialized 
                            to track your spending properly.
                        </p>
                        <Link
                            href="/setup"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
                        >
                            Complete Setup
                        </Link>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="text-amber-600 hover:text-amber-800 transition-colors shrink-0"
                    aria-label="Dismiss"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

