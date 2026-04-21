"use client";

import { LogOut } from "lucide-react";

interface LeaveCampaignModalProps {
    showLeaveModal: boolean;
    setShowLeaveModal: (show: boolean) => void;
    handleLeave: () => void;
    isLeaving: boolean;
}

export function LeaveCampaignModal({
    showLeaveModal,
    setShowLeaveModal,
    handleLeave,
    isLeaving
}: LeaveCampaignModalProps) {
    if (!showLeaveModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <LogOut className="w-8 h-8 ml-1" />
                </div>
                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Leave Campaign?</h3>
                <p className="text-gray-500 text-center mb-8">
                    Are you sure you want to leave this campaign? Once left, you will no longer receive updates.
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={() => setShowLeaveModal(false)}
                        disabled={isLeaving}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleLeave}
                        disabled={isLeaving}
                        className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLeaving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Confirm"}
                    </button>
                </div>
            </div>
        </div>
    );
}
