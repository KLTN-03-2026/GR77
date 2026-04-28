"use client";

import React from "react";

interface ReportModalProps {
    reportModalOpen: boolean;
    setReportModalOpen: (open: boolean) => void;
    reportReason: string;
    setReportReason: (val: string) => void;
    handleReport: () => void;
    title?: string;
}

export function ReportModal({
    reportModalOpen,
    setReportModalOpen,
    reportReason,
    setReportReason,
    handleReport,
    title = "Report"
}: ReportModalProps) {
    if (!reportModalOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-gray-900">{title}</h3>
                    <button onClick={() => setReportModalOpen(false)} className="text-gray-300 hover:text-gray-900 text-3xl font-light">&times;</button>
                </div>
                <div className="space-y-4">
                    <p className="text-sm text-gray-500 mb-4">Please specify why you are reporting this comment:</p>
                    <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Abusive content, spam, etc..."
                        className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-yellow-400 rounded-2xl p-5 text-gray-800"
                        rows={4}
                    />
                    <button
                        onClick={handleReport}
                        disabled={!reportReason.trim()}
                        className="w-full py-4 bg-yellow-500 text-white font-black rounded-full shadow-lg shadow-yellow-100 hover:bg-yellow-600 transition-all active:scale-95 disabled:opacity-50"
                    >
                        Submit Report
                    </button>
                </div>
            </div>
        </div>
    );
}
