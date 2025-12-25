"use client";

import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-rose-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Authentication Error</h1>
            <p className="text-slate-600">
              There was an error with the authentication link. It may have expired or already been used.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <Link
              href="/auth/login"
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Login
            </Link>
            
            <Link
              href="/auth/signup"
              className="block text-sm text-slate-600 hover:text-slate-900 hover:underline"
            >
              Create a new account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

