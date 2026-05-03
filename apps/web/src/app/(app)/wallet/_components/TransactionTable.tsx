'use client';

import { ExternalLink, Copy, Check, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { useState } from "react";

interface TransactionTableProps {
  transactions: any[];
  account: string | null;
}

export function TransactionTable({ transactions, account }: TransactionTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isHash = (text: string) => /^0x[a-fA-F0-9]{64}$/.test(text);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0891B2]/10 rounded-lg">
            <Wallet className="w-5 h-5 text-[#0891B2]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Activity History</h2>
            <p className="text-xs text-gray-400 font-medium tracking-wide">Real-time platform & blockchain events</p>
          </div>
        </div>
        {account && (
          <button
            onClick={() => window.open(`https://amoy.polygonscan.com/address/${account}`, '_blank')}
            className="group w-fit text-xs font-bold text-gray-500 hover:text-[#0891B2] transition-all flex items-center gap-2 bg-gray-50 hover:bg-[#0891B2]/5 px-4 py-2 rounded-full border border-gray-100 hover:border-[#0891B2]/20 shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on PolygonScan
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em]">
                <th className="px-6 py-4">Event & Type</th>
                <th className="px-6 py-4">Transaction Hash</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.length > 0 ? transactions.map((tx) => {
                const isExternal = tx.orderId && isHash(tx.orderId);
                const isOutflow = tx.type === 'DONATION' || tx.type === 'WITHDRAW';

                return (
                  <tr key={tx.id} className="group hover:bg-gray-50/30 transition-all duration-300">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 ${isOutflow
                          ? 'bg-rose-50 text-rose-500 group-hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100'
                          }`}>
                          {isOutflow ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 group-hover:text-[#0891B2] transition-colors leading-tight">
                            {tx.description || tx.type}
                          </p>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-wider">
                            {new Date(tx.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {tx.orderId ? (
                        <div className="flex items-center gap-2">
                          <code className="text-[12px] font-mono text-gray-400 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100 transition-all group-hover:border-gray-200">
                            {tx.orderId.substring(0, 6)}...{tx.orderId.substring(tx.orderId.length - 4)}
                          </code>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleCopy(tx.orderId!, tx.id)}
                              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
                              title="Copy full hash"
                            >
                              {copiedId === tx.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            {isExternal && (
                              <button
                                onClick={() => window.open(`https://amoy.polygonscan.com/tx/${tx.orderId}`, '_blank')}
                                className="p-1.5 hover:bg-[#0891B2]/10 rounded-md transition-colors text-gray-400 hover:text-[#0891B2]"
                                title="View on Explorer"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-300 text-xs italic">Internal System Ref</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end">
                        <p className={`text-base font-bold tracking-tight leading-none ${isOutflow ? 'text-gray-900' : 'text-emerald-600'
                          }`}>
                          {isOutflow ? '-' : '+'}{Number(tx.amount).toLocaleString()}
                          <span className="ml-1 text-[11px] font-semibold opacity-60">đ</span>
                        </p>
                        <span className={`text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-md ${tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
                          }`}>
                          {tx.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={3} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <Wallet className="w-12 h-12" />
                      <p className="font-bold text-gray-400 italic">No transaction data available.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
