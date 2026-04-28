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
    handleBlockchainDonate: (amountVnd: number, forceDemo?: boolean) => void;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white p-8 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300 relative">
                {donated ? (
                    <div className="text-center space-y-6 py-10">
                        <div className="w-20 h-20 bg-green-50 text-green-500 mx-auto rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-gray-900">Success!</h3>
                            <p className="text-gray-500 font-medium font-sans px-4">Cảm ơn bạn đã đóng góp cho chiến dịch.</p>
                        </div>
                        <button
                            onClick={() => {
                                setDonated(false);
                                setDonateOpen(false);
                            }}
                            className="bg-gray-900 text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg"
                        >
                            Đã hiểu
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="text-2xl font-black text-gray-900">Quyên góp cho quỹ</h3>
                            <button onClick={() => setDonateOpen(false)} className="text-gray-300 hover:text-gray-900 text-3xl font-light">&times;</button>
                        </div>

                        {blockchainError && (
                            <div className="bg-red-50 border border-red-100 p-4">
                                <p className="text-xs text-red-600 leading-relaxed font-bold">{blockchainError}</p>
                                <div className="flex gap-2 mt-2">
                                    <button onClick={() => handleBlockchainDonate(Number(donateAmount))} className="flex-1 py-1.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase">Try Again</button>
                                    <button onClick={() => handleBlockchainDonate(Number(donateAmount), true)} className="flex-1 py-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase">Demo Success</button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phương thức</p>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => { setDonationMethod('PAYOS'); setBlockchainError(null); }} className={`p-4 border-2 flex items-center gap-3 transition-all ${donationMethod === 'PAYOS' ? 'border-blue-500 bg-blue-50' : 'border-gray-50 bg-gray-50'}`}>
                                    <HandHeart className={`w-5 h-5 ${donationMethod === 'PAYOS' ? 'text-blue-500' : 'text-gray-400'}`} />
                                    <span className="text-sm font-bold text-gray-900">Direct Pay</span>
                                </button>
                                <button onClick={() => { setDonationMethod('BLOCKCHAIN'); setBlockchainError(null); }} className={`p-4 border-2 flex items-center gap-3 transition-all ${donationMethod === 'BLOCKCHAIN' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-50 bg-gray-50'}`}>
                                    <Wallet className={`w-5 h-5 ${donationMethod === 'BLOCKCHAIN' ? 'text-indigo-500' : 'text-gray-400'}`} />
                                    <span className="text-sm font-bold text-gray-900">Blockchain</span>
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Số tiền (VNĐ)</p>
                            <div className="grid grid-cols-4 gap-2">
                                {QUICK_AMOUNTS.map(amt => (
                                    <button key={amt} onClick={() => setDonateAmount(String(amt))} className={`py-3 text-[10px] font-bold border-2 transition-all ${donateAmount === String(amt) ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-100 text-gray-400 hover:border-blue-200'}`}>{(amt / 1000)}K</button>
                                ))}
                            </div>
                            <input type="number" value={donateAmount} onChange={(e) => setDonateAmount(e.target.value)} placeholder="Nhập số tiền khác..." className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 p-5 text-xl font-black text-gray-900" />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="flex flex-col gap-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lời nhắn (Tùy chọn)</p>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Viết lời nhắn động viên..."
                                    rows={2}
                                    className="w-full bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 p-4 text-sm font-medium text-gray-900 resize-none"
                                />
                            </div>

                            <button onClick={handleDonate} disabled={isDonating || blockchainLoading || !donateAmount} className={`w-full py-6 font-black text-xl text-white transition-all shadow-xl disabled:opacity-50 ${donationMethod === 'BLOCKCHAIN' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-blue-600 shadow-blue-100'}`}>
                                {isDonating || blockchainLoading ? "Processing..." : (donationMethod === 'BLOCKCHAIN' ? "Pay with MetaMask" : "Donate Now")}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
