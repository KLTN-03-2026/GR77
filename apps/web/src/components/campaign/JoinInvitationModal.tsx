"use client";

import React from "react";
import { Bell, Heart, X } from "lucide-react";

interface JoinInvitationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onJoin: () => void;
    isJoining?: boolean;
}

export function JoinInvitationModal({
    isOpen,
    onClose,
    onJoin,
    isJoining = false
}: JoinInvitationModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
            <div className="relative bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[95vh] flex flex-col">
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {/* Header Decoration */}
                    <div className="h-32 bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center relative">
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="w-20 h-20 bg-white rounded-3xl rotate-12 flex items-center justify-center shadow-lg transform hover:rotate-0 transition-transform duration-500">
                            <Heart className="w-10 h-10 text-pink-500 fill-pink-500" />
                        </div>
                        <div className="absolute -bottom-6 right-10 w-12 h-12 bg-yellow-400 rounded-2xl -rotate-12 flex items-center justify-center shadow-lg">
                            <Bell className="w-6 h-6 text-white animate-bounce" />
                        </div>
                    </div>

                    <div className="p-8 pt-10 text-center">
                        <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight">
                            Quyên góp thành công! 💝
                        </h3>
                        <p className="text-gray-500 leading-relaxed mb-8 flex flex-col gap-2">
                            <span>Bạn có muốn tham gia chiến dịch này không?</span>
                            <span className="text-sm bg-blue-50 text-blue-600 py-2 px-4 rounded-xl font-medium">
                                Thành viên sẽ nhận được thông báo và các cập nhật mới nhất về tiến độ của dự án.
                            </span>
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onJoin}
                                disabled={isJoining}
                                className="w-full py-4 bg-cyan-500 hover:bg-cyan-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-cyan-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isJoining ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    "Vâng, tôi muốn tham gia!"
                                )}
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                            >
                                Để sau nhé
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
