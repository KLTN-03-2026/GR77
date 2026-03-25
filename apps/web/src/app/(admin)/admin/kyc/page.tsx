'use client';

import { useState, useMemo } from 'react';
import Modal from '@/components/ui/Modal';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

// ── PAGINATION HELPER (Sync with User UI logic) ──
function getPageNumbers(current: number, total: number) {
  const delta = 1;
  const range: (number | string)[] = [];
  const rangeWithDots: (number | string)[] = [];
  let last: number | undefined;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }
  for (const i of range) {
    if (last !== undefined && typeof i === 'number' && i - last > 1) {
      rangeWithDots.push('...');
    }
    rangeWithDots.push(i);
    if (typeof i === 'number') last = i;
  }
  return rangeWithDots;
}

// ── TYPES & MOCK DATA ───────────────────────────────────────────────────

interface KycRecord {
  id: string;
  name: string;
  cccd: string;
  status: 'All' | 'Pending' | 'Approved' | 'Rejected';
  submitted: string;
  dob: string;
  phone: string;
  email: string;
  frontImage: string;
  backImage: string;
  selfieImage: string;
  ocr: {
    name: string;
    dob: string;
    cccd: string;
  };
  faceMatch: number;
}

const mockKycData: KycRecord[] = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    cccd: '042495695569',
    status: 'Pending',
    submitted: '21/03 14:30',
    dob: '01/01/1999',
    phone: '09xxxxxxxx',
    email: 'nguyenvana@gmail.com',
    frontImage: "/images/kyc/front-cccd.jpg",
    backImage: "/images/kyc/back-cccd.jpg",
    selfieImage: "/images/kyc/selfie.jpg",
    ocr: { name: 'Nguyễn Văn A', dob: '01/01/1999', cccd: '042495695569' },
    faceMatch: 87
  },
  {
    id: '2',
    name: 'Trần Thị B',
    cccd: '045265704046',
    status: 'Approved',
    submitted: '20/03 09:15',
    dob: '02/02/1998',
    phone: '08xxxxxxxx',
    email: 'tranb@gmail.com',
    frontImage: "/images/kyc/front-cccd.jpg",
    backImage: "/images/kyc/back-cccd.jpg",
    selfieImage: "/images/kyc/selfie.jpg",
    ocr: { name: 'Trần Thị B', dob: '02/02/1998', cccd: '045265704046' },
    faceMatch: 95
  },
  {
    id: '3',
    name: 'Lê Văn C',
    cccd: '042963560794',
    status: 'Rejected',
    submitted: '19/03 16:45',
    dob: '03/03/1997',
    phone: '07xxxxxxxx',
    email: 'lec@gmail.com',
    frontImage: "/images/kyc/front-cccd.jpg",
    backImage: "/images/kyc/back-cccd.jpg",
    selfieImage: "/images/kyc/selfie.jpg",
    ocr: { name: 'Lê Văn C', dob: '02/03/1997', cccd: '042963560794' },
    faceMatch: 45
  }
];

// ── UI COMPONENTS ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isApproved = status === 'Approved';
  const isRejected = status === 'Rejected';
  let bgColor = 'bg-[#FAED26]'; // pending yellow
  let dotColor = 'bg-yellow-500';

  if (isApproved) {
    bgColor = 'bg-[#7BC712]'; // green
    dotColor = 'bg-green-700';
  } else if (isRejected) {
    bgColor = 'bg-[#F76C6C]'; // red
    dotColor = 'bg-red-800';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-black ${bgColor}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
      {status}
    </span>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────

export default function AdminKycPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [selectedKyc, setSelectedKyc] = useState<KycRecord | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter Logic
  const filteredData = useMemo(() => {
    return mockKycData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cccd.includes(searchTerm);
      const matchesFilter = filterStatus === 'All' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">

        {/* Toolbar: Search & Filter */}
        <div className="px-5 py-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-[#2ba6e1]" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              placeholder="Search by name or CCCD..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#7598C1] transition-all bg-white"
            />
          </div>

          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200 w-full md:w-auto overflow-x-auto">
            {['All', 'Pending', 'Approved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => { setFilterStatus(status); setCurrentPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${filterStatus === status
                  ? 'bg-[#7598C1] text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-white">
                <th className="text-left px-5 py-3.5 font-semibold text-gray-700">User Name</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-700">CCCD Number</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-700">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-700">Submitted</th>
                <th className="text-center px-5 py-3.5 font-semibold text-gray-700 w-[120px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800">{row.name}</p>
                    </td>
                    <td className="px-4 py-4 font-mono text-gray-600">{row.cccd}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-4 py-4 text-gray-500">{row.submitted}</td>
                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => setSelectedKyc(row)}
                        className="px-4 py-1.5 rounded-lg text-sm font-semibold text-[#7598C1] bg-[#7598C1]/10 hover:bg-[#7598C1]/20 transition-colors inline-block"
                      >
                        ...
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 0 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">Showing {filteredData.length} records matching criteria</p>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
              typeof item === 'number' ? (
                <button key={idx} onClick={() => handlePageChange(item)} className={`w-11 h-11 flex items-center justify-center rounded-xl font-black transition-all transform active:scale-95 ${currentPage === item ? 'bg-[#7598C1] text-black shadow-lg shadow-[#7598C1]/30 scale-110' : 'border border-gray-200 text-gray-400 hover:bg-white hover:border-[#7598C1] hover:text-[#7598C1] bg-white'}`}>{item}</button>
              ) : (
                <span key={idx} className="px-2 text-gray-400 font-black">{item}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* KYC Detail Modal */}
      <Modal
        isOpen={!!selectedKyc}
        onClose={() => setSelectedKyc(null)}
        title="KYC Verification"
        maxWidth="max-w-4xl"
      >
        {selectedKyc && (
          <div className="space-y-6">

            {/* Top Row: User Info & Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
              {/* User Information */}
              <div className="bg-gray-50/50 p-5 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#7598C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  User Information
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex border-b border-gray-100 pb-2"><span className="font-medium text-gray-500 w-24">Name:</span> <span className="font-semibold">{selectedKyc.name}</span></div>
                  <div className="flex border-b border-gray-100 pb-2"><span className="font-medium text-gray-500 w-24">DOB:</span> <span>{selectedKyc.dob}</span></div>
                  <div className="flex border-b border-gray-100 pb-2"><span className="font-medium text-gray-500 w-24">CCCD:</span> <span className="font-mono">{selectedKyc.cccd}</span></div>
                  <div className="flex border-b border-gray-100 pb-2"><span className="font-medium text-gray-500 w-24">Phone:</span> <span>{selectedKyc.phone}</span></div>
                  <div className="flex"><span className="font-medium text-gray-500 w-24">Email:</span> <span>{selectedKyc.email}</span></div>
                </div>
              </div>

              {/* Identity Document */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#7598C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                  Identity Document
                </h3>
                <div className="space-y-4">
                  <div className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-[1.6]">
                    <img src={selectedKyc.frontImage} alt="Front CCCD" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    <span className="absolute bottom-3 left-3 text-white text-xs font-medium px-2 py-1 bg-black/30 rounded backdrop-blur-sm">Front Side</span>
                  </div>
                  <div className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 aspect-[1.6]">
                    <img src={selectedKyc.backImage} alt="Back CCCD" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                    <span className="absolute bottom-3 left-3 text-white text-xs font-medium px-2 py-1 bg-black/30 rounded backdrop-blur-sm">Back Side</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: OCR & Selfie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
              {/* OCR Result */}
              <div className="bg-[#7598C1]/5 p-5 rounded-xl border border-[#7598C1]/20">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#7598C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  OCR Extracted Data
                </h3>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="flex border-b border-[#7598C1]/10 pb-2">
                    <span className="font-medium text-gray-500 w-24">Name:</span>
                    <span className={`font-semibold ${selectedKyc.ocr.name !== selectedKyc.name ? 'text-red-500' : 'text-green-600'}`}>{selectedKyc.ocr.name}</span>
                  </div>
                  <div className="flex border-b border-[#7598C1]/10 pb-2">
                    <span className="font-medium text-gray-500 w-24">DOB:</span>
                    <span className={`${selectedKyc.ocr.dob !== selectedKyc.dob ? 'text-red-500' : 'text-green-600'}`}>{selectedKyc.ocr.dob}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-gray-500 w-24">CCCD:</span>
                    <span className={`font-mono ${selectedKyc.ocr.cccd !== selectedKyc.cccd ? 'text-red-500' : 'text-green-600'}`}>{selectedKyc.ocr.cccd}</span>
                  </div>
                </div>
                {(selectedKyc.ocr.name !== selectedKyc.name || selectedKyc.ocr.cccd !== selectedKyc.cccd) && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex gap-2 items-start">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                    <span>Warning: OCR data does not perfectly match user input information.</span>
                  </div>
                )}
              </div>

              {/* Selfie Verification */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#7598C1]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Selfie Verification
                </h3>
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="relative group w-32 h-32 rounded-xl overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                    <img src={selectedKyc.selfieImage} alt="Selfie" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>

                  <div className={`flex-1 flex flex-col items-center justify-center p-5 rounded-xl border ${selectedKyc.faceMatch > 80 ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                    <div className="text-center">
                      <p className="text-sm text-gray-500 font-medium mb-1">Face Match Score</p>
                      <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-4xl font-black ${selectedKyc.faceMatch > 80 ? 'text-[#7BC712]' : 'text-red-500'}`}>
                          {selectedKyc.faceMatch}%
                        </span>
                      </div>

                      {selectedKyc.faceMatch > 80 ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg w-full justify-center">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          VERIFIED
                        </div>
                      ) : (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg w-full justify-center">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          LOW MATCH
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setSelectedKyc(null)}
                className="px-5 py-2.5 w-full sm:w-auto rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                Request Re-upload
              </button>
              <button
                onClick={() => setSelectedKyc(null)}
                className="px-5 py-2.5 w-full sm:w-auto rounded-xl border border-transparent text-sm font-semibold text-white bg-[#F76C6C] hover:bg-red-600 hover:shadow-md transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                Reject
              </button>
              <button
                onClick={() => setSelectedKyc(null)}
                className="px-6 py-2.5 w-full sm:w-auto rounded-xl border border-transparent text-sm font-semibold text-black bg-[#7BC712] hover:bg-[#68A90F] hover:shadow-md transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Approve
              </button>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}
