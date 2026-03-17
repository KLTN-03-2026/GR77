'use client';

import { useState } from 'react';
import {
  WalletIcon,
  ArrowUpRightIcon,
  ArrowDownLeftIcon,
  Square2StackIcon,
  ClockIcon,
  CheckBadgeIcon,
  FingerPrintIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

const TRANSACTION_HISTORY = [
  { id: 1, type: 'Nạp tiền', time: '2024-03-15 14:30', amount: 5000000, status: 'Hoàn thành', hash: '0x7d2...f9e1' },
  { id: 2, type: 'Rút tiền', time: '2024-03-14 09:15', amount: 1000000, status: 'Đang xử lý', hash: '0x3a5...b2c4' },
  { id: 3, type: 'Quyên góp', time: '2024-03-12 16:45', amount: 2000000, status: 'Hoàn thành', hash: '0x9e1...e7d2' },
  { id: 4, type: 'Nạp tiền', time: '2024-03-10 11:00', amount: 10000000, status: 'Hoàn thành', hash: '0x1b4...d8a3' },
];

export default function WalletPage() {
  const [selectedMethod, setSelectedMethod] = useState('Bank');
  const [amount, setAmount] = useState('100,000,000');
  const walletAddr = '0xKindlink_f47ac10b58cc4372a5670e02b2c3d479';

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, '');
    if (!num) return '';
    return Number(num).toLocaleString('vi-VN');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(formatCurrency(e.target.value));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddr);
    alert('Đã sao chép địa chỉ ví!');
  };

  return (
    <div className="p-4 md:p-8 bg-[#f9fafb] min-h-screen text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* Synced Header with Favorites Page Style */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <WalletIcon className="w-8 h-8 text-cyan-500" />
              Wallet
            </h1>
            <p className="text-sm text-gray-400 ml-10">
              Quản lý tài chính và lịch sử giao dịch của bạn
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm group hover:border-cyan-200 transition-colors ml-10 md:ml-0">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mainnet Active</span>
            <div className="h-4 w-[1px] bg-gray-100 mx-1"></div>
            <span className="text-xs text-slate-600 font-mono font-semibold">{walletAddr.slice(0, 10)}...{walletAddr.slice(-4)}</span>
            <button onClick={copyToClipboard} className="text-slate-300 hover:text-cyan-500 transition-colors ml-1">
              <Square2StackIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Side: Stats & Transactions */}
          <div className="lg:col-span-8 space-y-8">

            {/* Balance Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl shadow-sm border border-yellow-100">
                      <CurrencyDollarIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full uppercase tracking-tighter">Số dư khả dụng</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Số dư hiện tại</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">125.500.000</h2>
                    <span className="text-cyan-600 font-bold text-sm">VND</span>
                  </div>
                  <p className="mt-4 text-[10px] text-slate-400 font-mono font-medium">≈ 5,020.24 KTC Token</p>
                </div>
              </div>

              <div className="relative p-8 rounded-[2rem] bg-white border border-gray-100 shadow-sm overflow-hidden group">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-pink-50 text-pink-500 rounded-2xl">
                      <HeartIcon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-pink-500 bg-pink-50 px-3 py-1 rounded-full uppercase tracking-tighter">Impact</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Đã quyên góp</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">42.000.000</h2>
                    <span className="text-slate-400 font-bold text-sm">VND</span>
                  </div>
                  <div className="mt-6">
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-pink-500 w-[65%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Blockchain History Panel */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-gray-900 text-white rounded-xl">
                    <FingerPrintIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Lịch sử giao dịch</h3>
                    <p className="text-xs text-slate-400">Dữ liệu được ghi nhận trên Blockchain</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-slate-500 hover:text-cyan-600 transition-colors uppercase tracking-widest border border-gray-200 px-5 py-2.5 rounded-full">
                  Xem trên Explorer
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-50 bg-gray-50/30">
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại</th>
                      <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hash / Thời gian</th>
                      <th className="px-8 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số lượng</th>
                      <th className="px-8 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {TRANSACTION_HISTORY.map((tx) => (
                      <tr key={tx.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-slate-700">{tx.type}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-xs font-mono font-semibold text-cyan-600 mb-0.5">{tx.hash}</p>
                          <p className="text-[10px] text-slate-400">{tx.time}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={`text-base font-bold ${tx.type === 'Nạp tiền' ? 'text-slate-900' : 'text-slate-400'}`}>
                            {tx.type === 'Nạp tiền' ? '+' : '-'}{tx.amount.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 ml-1.5 uppercase italic">Vnd</span>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${tx.status === 'Hoàn thành' ? 'border-green-100 text-green-600 bg-green-50' : 'border-blue-100 text-blue-600 bg-blue-50'
                            }`}>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side: Bridge & Actions */}
          <div className="lg:col-span-4 space-y-6">

            <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="w-5 h-5 text-cyan-500" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Nạp/Rút tiền</h3>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-2">
                  {['Bank', 'MoMo', 'ZaloPay'].map(m => (
                    <button
                      key={m}
                      onClick={() => setSelectedMethod(m)}
                      className={`py-3 rounded-xl border text-[10px] font-bold transition-all ${selectedMethod === m
                        ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                        : 'border-gray-50 bg-gray-50 text-slate-400'
                        }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nhập số tiền</p>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      className="w-full bg-gray-50 border border-transparent focus:border-cyan-100 focus:bg-white rounded-2xl py-4 px-6 text-3xl font-bold text-slate-900 tracking-tight focus:outline-none transition-all text-center"
                    />
                    <div className="absolute inset-x-0 -bottom-2.5 flex justify-center">
                      <span className="bg-gray-900 text-white px-4 py-1 rounded-xl text-[9px] font-bold uppercase">VND Currency</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button className="w-full py-4 bg-cyan-500 text-white font-bold rounded-xl text-sm hover:bg-cyan-600 transition-all shadow-lg shadow-cyan-100 active:scale-[0.98]">
                    Nạp tiền ngay
                  </button>
                  <button className="w-full py-4 bg-white border border-gray-100 text-slate-500 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all active:scale-[0.98]">
                    Rút tiền về ví
                  </button>
                </div>

                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center leading-tight">Cổng thanh toán QR</p>
                  <div className="mx-auto w-40 h-40 bg-white p-2 rounded-xl border border-gray-100">
                    <img
                      src="/wallet_qr_code_mockup.png"
                      alt="QR Bridge"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-900 rounded-[2rem] text-white overflow-hidden relative group">
              <div className="relative z-10">
                <h4 className="text-xl font-bold italic mb-4 tracking-tighter">
                  KINDLINK PRESTIGE
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mb-6">Nâng cấp ví để nhận thêm KTC Token khi quyên góp và các đặc quyền khác.</p>
                <button className="w-full py-3 bg-white text-slate-900 text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all">
                  Khám phá đặc quyền
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
