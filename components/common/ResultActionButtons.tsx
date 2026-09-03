"use client";

import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

interface ResultActionButtonsProps {
  onRetake: () => void;
  // NEW: Accept a specific path to redirect to
  dashboardPath?: string; 
}

export default function ResultActionButtons({ onRetake, dashboardPath = '/dashboard' }: ResultActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
      <button
        type="button"
        onClick={onRetake}
        className="inline-flex items-center justify-center gap-2 min-w-[180px] bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        <RefreshCw size={18} />
        Retake Test
      </button>
      <button
        type="button"
        onClick={() => router.push(dashboardPath)}
        className="inline-flex items-center justify-center gap-2 min-w-[180px] bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        <LayoutDashboard size={18} />
        Dashboard
      </button>
    </div>
  );
}