'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckBadgeIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ExclamationCircleIcon,
  LockOpenIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { ExclamationCircleIcon as ExclamationCircleIconSolid } from '@heroicons/react/24/solid';

// ── Types ──────────────────────────────────────────────────────────
export interface ReportedUser {
  id: string;
  name: string;
  email: string;
  role: 'Donor' | 'Admin' | 'Super Admin' | 'Organizer';
  avatarUrl?: string;
  isLocked?: boolean;
  lockReason?: string;
}

export interface ReportData {
  id: string;
  submitterName: string;
  submitterEmail: string;
  targetType: 'Campaign' | 'Comment';
  targetName: string;
  reason: string;
  details: string;
  status: 'PENDING' | 'RESOLVED';
  createdAt: string;
  reportedUser: ReportedUser;
}

// ── Sub-components ──────────────────────────────────────────────────
function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#7598C1] rounded-3xl px-6 py-4 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="bg-white/15 p-3 rounded-2xl group-hover:bg-white/20 transition-colors text-black flex items-center justify-center">
        <div className="w-9 h-9">{icon}</div>
      </div>
      <div className="text-black">
        <p className="text-lg font-bold tracking-wide uppercase">{label}</p>
        <h2 className="text-4xl font-black mt-1 tabular-nums">{value}</h2>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReportData['status'] }) {
  const styles: Record<string, string> = {
    'PENDING': 'bg-amber-50 text-amber-700 border-amber-100',
    'RESOLVED': 'bg-green-50 text-green-700 border-green-100',
  };
  
  const labels: Record<string, string> = {
    'PENDING': 'Chưa duyệt',
    'RESOLVED': 'Đã duyệt',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function TypeBadge({ type }: { type: ReportData['targetType'] }) {
  const styles: Record<string, string> = {
    'Campaign': 'bg-purple-50 text-purple-700 border-purple-100',
    'Comment': 'bg-slate-50 text-slate-700 border-slate-100',
  };

  const labels: Record<string, string> = {
    'Campaign': 'Chiến dịch',
    'Comment': 'Bình luận',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[type]}`}>
      {labels[type]}
    </span>
  );
}

function Avatar({ role }: { role: string }) {
  const isHighAdmin = role === 'Admin' || role === 'Super Admin' || role === 'ADMIN' || role === 'SUPER_ADMIN';
  if (!isHighAdmin) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden shadow-inner border border-gray-100 shrink-0">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
      </div>
    );
  }
  const gradientClass = role === 'Super Admin' || role === 'SUPER_ADMIN'
    ? 'from-[#FF3D77] via-[#FF9500] to-[#FFD500]'
    : 'from-[#FF3D77] via-[#338AFF] to-[#7B2CFE]';
  return (
    <div className="relative shrink-0 group">
      <div className={`absolute inset-[-2px] rounded-full bg-gradient-to-tr ${gradientClass} opacity-70 blur-[1px] animate-spin group-hover:opacity-100 transition-all duration-700 pointer-events-none`} style={{ animationDuration: '6s' }}></div>
      <div className="relative w-9 h-9 rounded-full bg-white p-[1px] shadow-sm">
        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Detail panel for Report
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [isReportDetailOpen, setIsReportDetailOpen] = useState(false);

  // Detail panel for User
  const [selectedUser, setSelectedUser] = useState<ReportedUser | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // ── Bootstrap / Mock Data ─────────────────────────────────────────
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockReports: ReportData[] = [
        {
          id: '1',
          submitterName: 'Nguyễn Văn A',
          submitterEmail: 'vana@gmail.com',
          targetType: 'Campaign',
          targetName: 'Cứu trợ miền Trung 2024',
          reason: 'Nội dung gây hiểu lầm',
          details: 'Chiến dịch này sử dụng hình ảnh từ năm 2020 để kêu gọi quyên góp cho hiện tại.',
          status: 'PENDING',
          createdAt: '2024-03-20T10:00:00Z',
          reportedUser: {
            id: 'u1',
            name: 'Lê Văn C',
            email: 'vanc@gmail.com',
            role: 'Organizer',
            isLocked: false,
          }
        },
        {
          id: '2',
          submitterName: 'Trần Thị B',
          submitterEmail: 'thib@gmail.com',
          targetType: 'Comment',
          targetName: 'Bình luận xúc phạm',
          reason: 'Hành vi quấy rối',
          details: 'Người dùng này liên tục nhắn tin rác vào các bài đăng của tôi.',
          status: 'RESOLVED',
          createdAt: '2024-03-19T15:30:00Z',
          reportedUser: {
            id: 'u2',
            name: 'Phạm Minh H',
            email: 'minhh@gmail.com',
            role: 'Donor',
            isLocked: true,
            lockReason: 'Vi phạm quy tắc cộng đồng',
          }
        },
        {
          id: '3',
          submitterName: 'Lê Hoàng D',
          submitterEmail: 'hoangd@gmail.com',
          targetType: 'Comment',
          targetName: 'Bình luận trong "Xây trường cho em"',
          reason: 'Ngôn từ thù ghét',
          details: 'Bình luận xúc phạm dân tộc và vùng miền.',
          status: 'PENDING',
          createdAt: '2024-03-18T09:15:00Z',
          reportedUser: {
            id: 'u3',
            name: 'Đỗ Mạnh G',
            email: 'manhg@gmail.com',
            role: 'Donor',
            isLocked: false,
          }
        },
        {
          id: '4',
          submitterName: 'Phạm Minh E',
          submitterEmail: 'minhe@gmail.com',
          targetType: 'Campaign',
          targetName: 'Hỗ trợ phẫu thuật tim',
          reason: 'Lừa đảo',
          details: 'Tôi đã liên hệ với bệnh viện nhưng họ nói không có bệnh nhân nào như mô tả.',
          status: 'PENDING',
          createdAt: '2024-03-21T11:20:00Z',
          reportedUser: {
            id: 'u4',
            name: 'Ngô Bảo K',
            email: 'baok@gmail.com',
            role: 'Organizer',
            isLocked: false,
          }
        },
        {
          id: '5',
          submitterName: 'Hoàng Kim F',
          submitterEmail: 'kimf@gmail.com',
          targetType: 'Campaign',
          targetName: 'Học bổng cho trẻ em nghèo',
          reason: 'Mạo danh',
          details: 'Người này mạo danh tổ chức từ thiện Heart-to-Heart.',
          status: 'RESOLVED',
          createdAt: '2024-03-17T14:45:00Z',
          reportedUser: {
            id: 'u5',
            name: 'Vũ Thị L',
            email: 'thil@gmail.com',
            role: 'Organizer',
            isLocked: false,
          }
        }
      ];
      
      setReports(mockReports);
      setLoading(false);
    };

    fetchReports();
  }, []);

  // ── Filter / Pagination ─────────────────────────────────────────
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        report.submitterName.toLowerCase().includes(q) ||
        report.reportedUser.name.toLowerCase().includes(q) ||
        report.targetName.toLowerCase().includes(q) ||
        report.reason.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || report.status === statusFilter;
      const matchesType = typeFilter === 'All' || report.targetType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reports, searchQuery, statusFilter, typeFilter]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  const handleViewReportDetails = (report: ReportData) => {
    setSelectedReport(report);
    setIsReportDetailOpen(true);
  };

  const handleViewUserDetails = (user: ReportedUser) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
    setActiveTab('overview');
  };

  const getPageNumbers = (current: number, total: number) => {
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
        if (last !== undefined && typeof i === 'number' && i - last > 1) rangeWithDots.push('...');
        rangeWithDots.push(i);
        if (typeof i === 'number') last = i;
    }
    return rangeWithDots;
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-20">

      {/* Hero Banner Interface matching Admin Users */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border text-sm font-bold bg-[#D0E3F9]/50 border-blue-200 text-blue-800">
        <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
        Hệ thống quản lý báo cáo — xem xét và xử lý các khiếu nại từ cộng đồng để đảm bảo môi trường Kindlink an toàn và minh bạch.
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatCard label="Tổng báo cáo" value={reports.length.toString()} icon={<ExclamationCircleIconSolid />} />
        <StatCard label="Báo cáo đã duyệt" value={reports.filter(r => r.status === 'RESOLVED').length.toString()} icon={<ShieldCheckIcon />} />
      </div>

      {/* ── TABLE ── */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#f8f9fa] border-b border-gray-300">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#2ba6e1]" strokeWidth={2.5} />
              <input
                type="text"
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-64 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-600 placeholder:text-gray-400"
                placeholder="Tìm kiếm nội dung báo cáo…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <div className="relative">
              <select
                className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">Trạng thái: Tất cả</option>
                <option value="PENDING">Chưa duyệt</option>
                <option value="RESOLVED">Đã duyệt</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">Loại: Tất cả</option>
                <option value="Campaign">Chiến dịch</option>
                <option value="Comment">Bình luận</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {paginatedReports.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-300">
                  <th className="px-5 py-3 font-bold text-black border-r border-gray-300">Người báo cáo</th>
                  <th className="px-5 py-3 font-bold text-black border-r border-gray-300">Người bị báo cáo</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Loại</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Lý do</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Ngày tạo</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Trạng thái</th>
                  <th className="px-4 py-3 font-bold text-black text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-20 text-center text-gray-400 italic">Đang tải danh sách báo cáo…</td>
                  </tr>
                ) : (
                  paginatedReports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 border-r border-gray-300">
                        <div>
                          <p className="font-bold text-gray-800 leading-tight">{report.submitterName}</p>
                          <p className="text-[12px] text-gray-500 mt-0.5">{report.submitterEmail}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 border-r border-gray-300">
                        <button 
                          onClick={() => handleViewUserDetails(report.reportedUser)}
                          className="group text-left flex items-center gap-3"
                        >
                          <Avatar role={report.reportedUser.role} />
                          <div>
                            <p className="font-bold text-blue-600 group-hover:text-blue-800 leading-tight transition-colors underline decoration-blue-200">{report.reportedUser.name}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{report.reportedUser.email}</p>
                          </div>
                        </button>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <div className="flex flex-col gap-1">
                          <TypeBadge type={report.targetType} />
                          <p className="font-medium text-[11px] text-gray-500 truncate max-w-[120px]">{report.targetName}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 font-medium text-gray-700">
                        {report.reason}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-gray-500 font-medium">
                        {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <StatusBadge status={report.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button title="Xem chi tiết báo cáo" onClick={() => handleViewReportDetails(report)} className="text-blue-500 hover:text-blue-700 transition-colors">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {report.status === 'PENDING' && (
                            <>
                              <button title="Duyệt báo cáo" className="text-green-500 hover:text-green-700 transition-colors">
                                <CheckBadgeIcon className="w-5 h-5" />
                              </button>
                              <button title="Bỏ qua" className="text-gray-400 hover:text-gray-600 transition-colors">
                                <NoSymbolIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-gray-400">
              <MagnifyingGlassIcon className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">Không tìm thấy báo cáo nào.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">
            Hiển thị {filteredReports.length} báo cáo
          </p>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
              typeof item === 'number' ? (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(item)}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl font-black transition-all transform active:scale-95 ${currentPage === item
                    ? 'bg-[#7598C1] text-black shadow-lg scale-110'
                    : 'border border-gray-200 text-gray-400 hover:bg-white hover:border-[#7598C1] hover:text-[#7598C1] bg-white'
                    }`}
                >
                  {item}
                </button>
              ) : (
                <span key={idx} className="px-2 text-gray-400 font-black">{item}</span>
              )
            )}
          </div>
        </div>
      )}

      {/* ── REPORT DETAIL SLIDE-OVER ── */}
      {isReportDetailOpen && selectedReport && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-black/30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl h-screen shadow-2xl overflow-y-auto flex flex-col">
            <div className="p-8 bg-[#7598C1] text-black flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <ExclamationCircleIconSolid className="w-7 h-7 text-black" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase">Chi tiết báo cáo</h2>
                  <p className="font-bold opacity-70 text-sm">ID: #{selectedReport.id}</p>
                </div>
              </div>
              <button onClick={() => setIsReportDetailOpen(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-8 space-y-8">
              {/* Report Header Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Người báo cáo</p>
                  <p className="text-base font-bold text-gray-900">{selectedReport.submitterName}</p>
                  <p className="text-sm text-gray-500">{selectedReport.submitterEmail}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Thời gian</p>
                  <p className="text-base font-bold text-gray-900">{new Date(selectedReport.createdAt).toLocaleString('vi-VN')}</p>
                  <StatusBadge status={selectedReport.status} />
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Reported User Section */}
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest mb-3">Người bị báo cáo</p>
                <div className="flex items-center gap-4">
                    <Avatar role={selectedReport.reportedUser.role} />
                    <div>
                        <p className="text-lg font-black text-gray-900">{selectedReport.reportedUser.name}</p>
                        <p className="text-sm text-gray-500">{selectedReport.reportedUser.email}</p>
                        <button 
                            onClick={() => handleViewUserDetails(selectedReport.reportedUser)}
                            className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                        >
                            Xem hồ sơ đầy đủ <EyeIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>
              </div>

              {/* Target Section */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Loại thực thể bị báo cáo</p>
                  <TypeBadge type={selectedReport.targetType} />
                </div>
                <p className="text-xl font-black text-[#24305E] truncate">{selectedReport.targetName}</p>
              </div>

              {/* Content Section */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Lý do báo cáo</p>
                  <div className="p-4 bg-red-50 text-red-700 font-bold rounded-xl border border-red-100 flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 shrink-0" />
                    {selectedReport.reason}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Chi tiết khiếu nại</p>
                  <div className="p-5 bg-white border border-gray-200 rounded-2xl text-gray-700 italic leading-relaxed">
                    "{selectedReport.details}"
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              {selectedReport.status !== 'RESOLVED' && (
                <>
                  <button className="flex-1 py-4 bg-green-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-green-700 transition-all">
                    <CheckBadgeIcon className="w-5 h-5" /> Duyệt & Xử lý
                  </button>
                  <button className="flex-1 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-100 transition-all">
                    <NoSymbolIcon className="w-5 h-5" /> Bỏ qua báo cáo
                  </button>
                </>
              )}
              {selectedReport.status === 'RESOLVED' && (
                <div className="w-full flex items-center justify-center gap-2 py-4 text-green-600 font-black text-xs uppercase tracking-widest">
                  <ShieldCheckIcon className="w-6 h-6" /> Báo cáo này đã được xử lý
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── USER DETAIL SLIDE-OVER (IDENTICAL to User Management) ── */}
      {isUserDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-[120] flex justify-end bg-black/30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl h-screen shadow-2xl overflow-y-auto flex flex-col">
            <div className="p-8 bg-[#7598C1] text-black flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar role={selectedUser.role} />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedUser.name}</h2>
                  <p className="font-bold opacity-70 text-sm">{selectedUser.email}</p>
                  <p className="text-xs font-black opacity-80 uppercase mt-0.5">{selectedUser.role}</p>
                </div>
              </div>
              <button onClick={() => setIsUserDetailOpen(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex border-b px-8 gap-6 bg-gray-50/50">
              {[{ id: 'overview', label: 'Tổng quan' }, { id: 'campaigns', label: 'Chiến dịch' }, { id: 'donations', label: 'Quyên góp' }, { id: 'activity', label: 'Hoạt động' }, { id: 'reports', label: 'Báo cáo' }].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-8 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border rounded-xl">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Trạng thái</p>
                      <p className={`text-lg font-black ${selectedUser.isLocked ? 'text-red-600' : 'text-green-600'}`}>
                        {selectedUser.isLocked ? 'ĐÃ KHÓA' : 'HOẠT ĐỘNG'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 border rounded-xl">
                      <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Vai trò</p>
                      <p className="text-lg font-black text-gray-900">{selectedUser.role}</p>
                    </div>
                  </div>
                  {selectedUser.isLocked && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-900">
                      <ExclamationTriangleIcon className="w-6 h-6 shrink-0" />
                      <div>
                        <p className="text-sm font-bold uppercase">Lý do khóa</p>
                        <p className="text-sm italic font-medium">"{selectedUser.lockReason || 'N/A'}"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pl-8 pt-2">
                  {[
                    { id: 1, action: 'LOGIN', details: 'Đăng nhập thành công từ IP 1.2.3.4', createdAt: '2024-03-20T08:00:00Z' },
                    { id: 2, action: 'UPDATE_PROFILE', details: 'Cập nhật ảnh đại diện', createdAt: '2024-03-15T14:20:00Z' },
                    { id: 3, action: 'CREATE_COMMENT', details: 'Bình luận trong chiến dịch Trẻ em nghèo', createdAt: '2024-03-10T09:45:00Z' },
                  ].map((log) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[41px] top-1 bg-white border-2 border-slate-900 w-4 h-4 rounded-full shadow-sm" />
                      <p className="text-sm font-black text-gray-800 uppercase">{log.action}</p>
                      <p className="text-[12px] text-gray-500 mt-1">"{log.details}"</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        {new Date(log.createdAt).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reports' && (
                <div className="space-y-4">
                  {[
                    { id: '101', reason: 'Ngôn từ thù ghét', status: 'RESOLVED', createdAt: '2024-01-15T10:00:00Z' },
                    { id: '102', reason: 'Spam nội dung', status: 'PENDING', createdAt: '2024-02-20T11:30:00Z' },
                  ].map((rep) => (
                    <div key={rep.id} className="p-4 bg-gray-50 border rounded-xl flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-800">{rep.reason}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{new Date(rep.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${rep.status === 'RESOLVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {rep.status === 'RESOLVED' ? 'Đã xử lý' : 'Đang chờ'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {(activeTab === 'campaigns' || activeTab === 'donations') && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 opacity-50">
                      <MagnifyingGlassIcon className="w-12 h-12" />
                      <p className="font-bold uppercase text-xs tracking-widest">Chưa có dữ liệu lịch sử</p>
                  </div>
              )}
            </div>

            {/* Footer actions Matching Users Page */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${selectedUser.isLocked ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
              >
                {selectedUser.isLocked
                  ? <><LockOpenIcon className="w-5 h-5" /> Khôi phục truy cập</>
                  : <><LockClosedIcon className="w-5 h-5" /> Khóa tài khoản</>}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
