"use client";

import React from "react";
import { CheckCircle, HandHeart, Wallet } from "lucide-react";

interface DonateModalProps {
    donateOpen: boolean;
    setDonateOpen: (open: boolean) => void;
    donateAmount: string;
    setDonateAmount: (val: string) => void;
    isDonating: boolean;
    donated: boolean;
    setDonated: (val: boolean) => void;
    donationMethod: 'PAYOS' | 'BLOCKCHAIN';
    setDonationMethod: (val: 'PAYOS' | 'BLOCKCHAIN') => void;
    blockchainLoading: boolean;
    blockchainError: string | null;
    setBlockchainError: (val: string | null) => void;
    handleDonate: () => void;
    handleBlockchainDonate: (amountVnd: number) => void;
    QUICK_AMOUNTS: number[];
    message: string;
    setMessage: (val: string) => void;
}

export function DonateModal({
    donateOpen,
    setDonateOpen,
    donateAmount,
    setDonateAmount,
    isDonating,
    donated,
    setDonated,
    donationMethod,
    setDonationMethod,
    blockchainLoading,
    blockchainError,
    setBlockchainError,
    handleDonate,
    handleBlockchainDonate,
    QUICK_AMOUNTS,
    message,
    setMessage
}: DonateModalProps) {
    if (!donateOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
            <div className="bg-white p-5 sm:p-8 lg:p-10 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[24px] sm:rounded-[32px] animate-in fade-in zoom-in duration-300 relative overflow-hidden max-h-[95vh] flex flex-col">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
                <div className="overflow-y-auto pr-1 -mr-1 custom-scrollbar flex-1">
                    {donated ? (
                        <div className="text-center space-y-6 py-10">
                            <div className="w-20 h-20 bg-green-50 text-green-500 mx-auto rounded-full flex items-center justify-center">
                                <CheckCircle className="w-12 h-12" />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Thành công!</h3>
                                <p className="text-gray-500 font-bold px-4">Cảm ơn bạn đã đồng hành cùng chiến dịch. Sự đóng góp của bạn là vô cùng quý giá!</p>
                            </div>
                            <button
                                onClick={() => {
                                    setDonated(false);
                                    setDonateOpen(false);
                                }}
                                className="w-full bg-cyan-500 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-cyan-600 transition-all active:scale-95 shadow-lg shadow-cyan-100/50"
                            >
                                Tuyệt vời
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Quyên góp cho quỹ</h3>
                                <button onClick={() => setDonateOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all text-2xl font-light">&times;</button>
                            </div>

                            {blockchainError && (
                                <div className="bg-red-50 border border-red-100 p-6 rounded-2xl border-dashed border-red-200 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                        <p className="text-sm text-red-600 leading-relaxed font-black uppercase tracking-wider">Thanh toán không thành công</p>
                                    </div>
                                    <p className="text-xs text-red-500 leading-relaxed font-bold mb-4">{blockchainError}</p>
                                    <button
                                        onClick={() => {
                                            setBlockchainError(null);
                                            if (donationMethod === 'BLOCKCHAIN') {
                                                handleBlockchainDonate(Number(donateAmount));
                                            } else {
                                                handleDonate();
                                            }
                                        }}
                                        className="w-full py-3 bg-red-500 text-white text-xs font-black uppercase rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                                    >
                                        Thử lại ngay
                                    </button>
                                </div>
                            )}

                            <div className="space-y-4">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Phương thức thanh toán</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => { setDonationMethod('PAYOS'); setBlockchainError(null); }} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${donationMethod === 'PAYOS' ? 'border-cyan-500 bg-cyan-50/50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}>
                                        <HandHeart className={`w-6 h-6 ${donationMethod === 'PAYOS' ? 'text-cyan-500' : 'text-gray-400'}`} />
                                        <span className={`text-sm font-black ${donationMethod === 'PAYOS' ? 'text-cyan-700' : 'text-gray-500'}`}>Direct Pay</span>
                                    </button>
                                    <button onClick={() => { setDonationMethod('BLOCKCHAIN'); setBlockchainError(null); }} className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${donationMethod === 'BLOCKCHAIN' ? 'border-cyan-500 bg-cyan-50/50' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}>
                                        <Wallet className={`w-6 h-6 ${donationMethod === 'BLOCKCHAIN' ? 'text-cyan-500' : 'text-gray-400'}`} />
                                        <span className={`text-sm font-black ${donationMethod === 'BLOCKCHAIN' ? 'text-cyan-700' : 'text-gray-500'}`}>Blockchain</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Số tiền (VNĐ)</p>
                                <div className="grid grid-cols-4 gap-2">
                                    {QUICK_AMOUNTS.map(amt => (
                                        <button key={amt} onClick={() => setDonateAmount(String(amt))} className={`py-3 rounded-xl text-[11px] font-black border-2 transition-all ${donateAmount === String(amt) ? 'border-cyan-500 bg-cyan-500 text-white shadow-lg shadow-cyan-100' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-cyan-200 hover:text-cyan-500'}`}>{(amt / 1000)}K</button>
                                    ))}
                                </div>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={donateAmount}
                                        onChange={(e) => setDonateAmount(e.target.value)}
                                        placeholder="Nhập số tiền khác..."
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-500 focus:bg-white focus:ring-0 rounded-2xl p-5 text-2xl font-black text-gray-900 transition-all placeholder:text-gray-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 font-black text-lg">VND</div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-2">
                                <div className="flex flex-col gap-3">
                                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Lời nhắn (Tùy chọn)</p>
                                    <textarea
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Viết lời nhắn động viên..."
                                        rows={2}
                                        className="w-full bg-gray-50 border-2 border-transparent focus:border-cyan-500 focus:bg-white focus:ring-0 rounded-2xl p-4 text-sm font-bold text-gray-900 resize-none transition-all placeholder:text-gray-300"
                                    />
                                </div>

                                <button onClick={handleDonate} disabled={isDonating || blockchainLoading || !donateAmount} className="w-full py-5 rounded-[20px] font-black text-xl text-white transition-all shadow-xl disabled:opacity-50 bg-cyan-500 hover:bg-cyan-600 shadow-cyan-100/50 active:scale-[0.98] mt-2">
                                    {isDonating || blockchainLoading ? "Đang xử lý..." : "Quyên góp ngay"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
