'use client';

import { ExternalLink } from "lucide-react";

interface TransactionTableProps {
  transactions: any[];
  account: string | null;
}

export function TransactionTable({ transactions, account }: TransactionTableProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
          <h2 className="text-xl font-bold text-gray-900">Activity History</h2>
          <span className="inline-block w-fit text-[10px] font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full uppercase tracking-widest leading-none whitespace-nowrap">
            Kindlink Activity
          </span>
        </div>
        {account && (
          <button
            onClick={() => window.open(`https://amoy.polygonscan.com/address/${account}`, '_blank')}
            className="w-fit text-sm font-bold text-[#0891B2] hover:text-[#06778f] transition-all flex items-center gap-1.5 underline underline-offset-4 decoration-[#0891B2]/20 hover:decoration-[#0891B2]"
          >
            <ExternalLink className="w-4 h-4" />
            PolygonScan
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Transaction</th>
              <th className="px-8 py-5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {transactions.length > 0 ? transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-7">
                  <p className="font-bold text-gray-800">{tx.description || 'Kindlink Activity'}</p>
                  <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase leading-none">
                    {new Date(tx.createdAt).toLocaleDateString("en-US")}
                  </p>
                </td>
                <td className="px-8 py-7 text-right">
                  <p className="text-lg font-bold text-gray-900 leading-none">
                    {tx.type === 'DONATION' ? '-' : '+'}{Number(tx.amount).toLocaleString()} VNĐ
                  </p>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={2} className="py-24 text-center text-gray-300 font-bold italic">
                  No internal transaction data available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
