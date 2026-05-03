'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  XMarkIcon,
  PlusIcon,
  ChevronDownIcon,
  ShieldExclamationIcon,
  ArrowUpCircleIcon,
  EnvelopeIcon,
  ShieldExclamationIcon as SuperAdminIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { AdminPermission, PermissionGroups } from '@/constants/permissions';
import UserAvatar from '@/components/common/UserAvatar';

// ── Types ──────────────────────────────────────────────────────────
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Donor' | 'Admin' | 'Super Admin' | 'Organizer';
  rawRole: 'USER' | 'ORGANIZER' | 'ADMIN' | 'SUPER_ADMIN';
  walletAddress: string;
  kycStatus: 'Verified' | 'Pending' | 'Rejected' | 'Unverified';
  totalContributed: number;
  avatarUrl?: string;
  createdAt?: string;
  isLocked?: boolean;
  permissions?: string[];
}

type CallerRole = 'ADMIN' | 'SUPER_ADMIN';

// ── Utils ──────────────────────────────────────────────────────────
function decodeJwt(token: string): { role?: string; sub?: string } | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

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
    if (last !== undefined && typeof i === 'number' && i - last > 1) rangeWithDots.push('...');
    rangeWithDots.push(i);
    if (typeof i === 'number') last = i;
  }
  return rangeWithDots;
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

function RoleBadge({ role }: { role: UserData['role'] }) {
  const styles: Record<string, string> = {
    'Donor': 'bg-blue-50 text-blue-700 border-blue-100',
    'Organizer': 'bg-amber-50 text-amber-700 border-amber-100',
    'Admin': 'bg-purple-50 text-purple-700 border-purple-100',
    'Super Admin': 'bg-rose-50 text-rose-700 border-rose-100',
  };
  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight border ${styles[role] || 'bg-gray-50 text-gray-600'}`}>
      {role}
    </span>
  );
}


// ── Role permission helpers ─────────────────────────────────────────
const ROLE_LEVEL: Record<string, number> = {
  USER: 0, ORGANIZER: 1, ADMIN: 2, SUPER_ADMIN: 3,
};

function canUpgradeToAdmin(callerRole: CallerRole, targetRawRole: string): boolean {
  return callerRole === 'SUPER_ADMIN' && ROLE_LEVEL[targetRawRole] < ROLE_LEVEL['ADMIN'];
}

// ── Main Page ───────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [callerRole, setCallerRole] = useState<CallerRole>('ADMIN');

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Create modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [createSuccess, setCreateSuccess] = useState('');

  // Detail panel
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Lock/Unlock modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: UserData | null;
    action: 'lock' | 'unlock';
    reason: string;
  }>({ isOpen: false, user: null, action: 'lock', reason: '' });

  // Upgrade role modal
  const [upgradeModal, setUpgradeModal] = useState<{
    isOpen: boolean;
    user: UserData | null;
  }>({ isOpen: false, user: null });

  // ── Bootstrap ─────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('adminAccessToken');
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded?.role === 'SUPER_ADMIN') setCallerRole('SUPER_ADMIN');
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users?roleGroup=MEMBERS`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();

      // Map security nesting to flat structure for easier UI consumption
      const mapped = data.map((u: any) => ({
        ...u,
        isLocked: u.security?.isLocked || false,
        lockReason: u.security?.lockReason || '',
      }));

      setUsers(mapped);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── API Helpers ───────────────────────────────────────────────────
  const authFetch = (url: string, options: RequestInit = {}) =>
    fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
        ...(options.headers || {}),
      },
    });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateSuccess('');
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001')}/users`, {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password || undefined,
          role: 'USER'
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create user');
      setCreateSuccess(`Account created. A verification email has been sent to ${formData.email}.`);
      setFormData({ email: '', password: '' });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${id}`);
      setSelectedUser(await res.json());
      setIsDetailOpen(true);
      setActiveTab('overview');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openConfirmModal = (user: UserData) => {
    setConfirmModal({ isOpen: true, user, action: user.isLocked ? 'unlock' : 'lock', reason: '' });
  };

  const handleToggleLock = async () => {
    const { user, action, reason } = confirmModal;
    if (!user) return;
    if (action === 'lock' && !reason.trim()) {
      alert('Please provide a reason for locking the account');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${user.id}/${action}`, {
        method: 'POST',
        body: action === 'lock' ? JSON.stringify({ reason }) : '{}',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Failed to ${action} user`);
      setConfirmModal({ ...confirmModal, isOpen: false });
      await fetchUsers();
      if (isDetailOpen && selectedUser?.id === user.id) handleViewDetails(user.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpgradeRole = async () => {
    const { user } = upgradeModal;
    if (!user) return;
    setIsSubmitting(true);
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${user.id}/upgrade-role`, {
        method: 'POST',
        body: '{}',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Failed to upgrade role');
      setUpgradeModal({ isOpen: false, user: null });
      await fetchUsers();
      if (isDetailOpen && selectedUser?.id === user.id) handleViewDetails(user.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermissions = async (userId: string, permissions: string[]) => {
    setIsSubmitting(true);
    try {
      const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${userId}/permissions`, {
        method: 'POST',
        body: JSON.stringify({ permissions }),
      });
      if (!res.ok) throw new Error('Failed to update permissions');

      // Update local state
      setSelectedUser((prev: any) => ({ ...prev, permissions }));
      setUsers((prev) => prev.map(u => u.id === userId ? { ...u, permissions } : u));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Filter / Pagination ─────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q);
      const matchesRole = true;
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Locked' ? user.isLocked : !user.isLocked);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(start, start + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const isSuperAdmin = callerRole === 'SUPER_ADMIN';

  // Dynamic role options based on actual data
  const uniqueRoles = useMemo(() => {
    const roles = Array.from(new Set(users.map((u) => u.rawRole).filter(Boolean)));
    // For Users page, strictly exclude ADMIN roles
    return roles.filter(r => r !== 'ADMIN' && r !== 'SUPER_ADMIN');
  }, [users]);

  const roleLabelMap: Record<string, string> = {
    USER: 'Nhà tài trợ',
    ORGANIZER: 'Người tổ chức',
    ADMIN: 'Quản trị viên',
    SUPER_ADMIN: 'Super Admin',
  };

  // Role options available in "Add Member" form
  const createRoleOptions = isSuperAdmin
    ? [
      { value: 'USER', label: 'Nhà tài trợ' },
      { value: 'ORGANIZER', label: 'Người tổ chức' },
      { value: 'ADMIN', label: 'Admin (Vận hành)' },
      { value: 'SUPER_ADMIN', label: 'Super Admin' },
    ]
    : [
      { value: 'USER', label: 'Nhà tài trợ' },
      { value: 'ORGANIZER', label: 'Người tổ chức' },
    ];

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 pb-20">

      {/* Role Badge Banner */}
      <div className={`flex items-center gap-3 p-3 rounded-2xl border text-sm font-bold ${isSuperAdmin
        ? 'bg-rose-50 border-rose-200 text-rose-800'
        : 'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
        <ShieldCheckIcon className="w-5 h-5 shrink-0" />
        {isSuperAdmin
          ? 'Bạn đã đăng nhập với vai trò Super Admin — bạn có thể quản lý tất cả người dùng bao gồm Admin, và nâng cấp quyền.'
          : 'Bạn đã đăng nhập với vai trò Admin (Vận hành) — bạn chỉ có thể quản lý Nhà tài trợ và Người tổ chức.'}
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatCard label="Tổng người dùng" value={users.length.toLocaleString()} icon={<UserGroupIcon />} />
        <StatCard label="Đã khóa" value={users.filter((u) => u.isLocked).length.toLocaleString()} icon={<LockClosedIcon />} />
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
                className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-64 text-sm font-bold outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-700 placeholder:text-gray-400"
                placeholder="Tìm kiếm danh tính…"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>


            <div className="relative">
              <select
                className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm font-bold bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none"
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">Trạng thái: Tất cả</option>
                <option value="Active">Hoạt động</option>
                <option value="Locked">Đã khóa</option>
              </select>
              <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <button
            onClick={() => { setIsModalOpen(true); setCreateSuccess(''); }}
            className="ml-auto bg-[#7598C1] hover:bg-[#5DA2D5] text-black px-4 py-1.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-1.5"
          >
            <PlusIcon className="h-4 w-4 stroke-[2.5]" /> Thêm thành viên
          </button>
        </div>

        <div className="overflow-x-auto">
          {paginatedUsers.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-300">
                  <th className="px-5 py-3 font-bold text-black border-r border-gray-300 text-center w-16">ID</th>
                  <th className="px-5 py-3 font-bold text-black border-r border-gray-300">Danh tính</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Vai trò</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">KYC</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Bảo mật</th>
                  <th className="px-4 py-3 font-bold text-black text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-20 text-center text-gray-400 italic">Đang đồng bộ dữ liệu…</td>
                  </tr>
                ) : (
                  paginatedUsers.map((user, index) => (
                    <tr key={user.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 border-r border-gray-300 text-center font-bold text-gray-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-5 py-3 border-r border-gray-300">
                        <div className="flex items-center gap-3">
                          <UserAvatar role={user.rawRole} src={user.avatarUrl} />
                          <div>
                            <p className="font-bold text-gray-800 leading-tight">{user.name}</p>
                            <p className="text-[12px] text-gray-500 mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 border-r border-gray-300">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300 text-[11px] font-bold text-gray-600">
                        {user.kycStatus === 'Verified' ? 'Đã xác minh' : user.kycStatus === 'Pending' ? 'Đang chờ' : user.kycStatus === 'Rejected' ? 'Bị từ chối' : 'Chưa xác minh'}
                      </td>
                      <td className="px-4 py-3 border-r border-gray-300">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight ${user.isLocked
                          ? 'bg-red-50 text-red-600 border border-red-100'
                          : 'bg-[#7BC712] text-black'
                          }`}>
                          {user.isLocked ? 'Đã khóa' : 'Hoạt động'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-3">
                          <button title="Xem chi tiết" onClick={() => handleViewDetails(user.id)} className="text-blue-500 hover:text-blue-700 transition-colors">
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {canUpgradeToAdmin(callerRole, user.rawRole) && (
                            <button title="Nâng cấp lên Admin" onClick={() => setUpgradeModal({ isOpen: true, user })} className="text-gray-400 hover:text-purple-600 transition-colors">
                              <ArrowUpCircleIcon className="w-5 h-5" />
                            </button>
                          )}
                          {/* ADMIN không được khoá ADMIN/SUPER_ADMIN */}
                          {(isSuperAdmin || ROLE_LEVEL[user.rawRole] < ROLE_LEVEL['ADMIN']) && (
                            <button
                              title={user.isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                              onClick={() => openConfirmModal(user)}
                              className={user.isLocked ? 'text-green-500' : 'text-red-400'}
                            >
                              {user.isLocked ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                            </button>
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
              <p className="text-xl font-medium">Không tìm thấy kết quả.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
              typeof item === 'number' ? (
                <button
                  key={idx}
                  onClick={() => setCurrentPage(Math.max(1, Math.min(item, totalPages)))}
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

      {/* ── LOCK / UNLOCK MODAL ── */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${confirmModal.action === 'lock' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {confirmModal.action === 'lock' ? <ShieldExclamationIcon className="w-10 h-10" /> : <ShieldCheckIcon className="w-10 h-10" />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                  {confirmModal.action === 'lock' ? 'Khóa tài khoản' : 'Khôi phục truy cập'}
                </h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Thực thi bảo mật</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 flex items-center gap-4">
              <UserAvatar role={confirmModal.user?.rawRole} src={confirmModal.user?.avatarUrl} />
              <div>
                <p className="font-black text-gray-900">{confirmModal.user?.name}</p>
                <p className="text-sm font-bold text-gray-500">{confirmModal.user?.email}</p>
                <RoleBadge role={confirmModal.user?.role as any} />
              </div>
            </div>


            {confirmModal.action === 'lock' ? (
              <div className="space-y-3">
                <p className="text-sm font-bold text-gray-700">
                  Bạn chuẩn bị <span className="text-red-600 font-black underline">KHÓA</span> tài khoản này.
                </p>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">
                    Lý do khóa (Bắt buộc)
                  </label>
                  <textarea
                    value={confirmModal.reason}
                    onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                    placeholder="Mô tả vi phạm hoặc lý do…"
                    className="w-full h-28 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
            ) : (
              <p className="text-sm font-bold text-gray-700">
                Xác nhận <span className="text-green-600 font-black underline">KHÔI PHỤC</span> tài khoản. Thành viên sẽ có lại quyền truy cập ngay lập tức.
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                Hủy
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleToggleLock}
                className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${confirmModal.action === 'lock'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                {isSubmitting ? 'Đang phân tích…' : confirmModal.action === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UPGRADE ROLE MODAL ── */}
      {upgradeModal.isOpen && upgradeModal.user && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-purple-50 text-purple-600">
                <ArrowUpCircleIcon className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">Nâng cấp lên Admin</h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Nâng cao đặc quyền · Chỉ Super Admin</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6 flex items-center gap-4">
              <UserAvatar role={upgradeModal.user.rawRole} src={upgradeModal.user.avatarUrl} />
              <div>
                <p className="font-black text-gray-900">{upgradeModal.user.name}</p>

                <p className="text-sm font-bold text-gray-500">{upgradeModal.user.email}</p>
                <p className="text-xs font-black text-purple-500 mt-1">
                  {upgradeModal.user.role} → <span className="text-purple-700">Admin</span>
                </p>
              </div>
            </div>

            <p className="text-sm font-bold text-gray-700 mb-6">
              Bạn chuẩn bị cấp quyền <span className="text-purple-600 font-black underline">ADMIN</span> cho tài khoản này. Điều này cấp quyền truy cập vận hành đầy đủ vào bảng quản trị.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setUpgradeModal({ isOpen: false, user: null })} className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors">
                Hủy
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleUpgradeRole}
                className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest bg-purple-600 text-white shadow-xl shadow-purple-200 hover:bg-purple-700 transition-all active:scale-95"
              >
                {isSubmitting ? 'Đang nâng cấp…' : 'Xác nhận nâng cấp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE USER MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-[#7598C1] pl-3 uppercase tracking-tight">Thêm Thành Viên</h2>

            {createSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex gap-3 items-start">
                  <EnvelopeIcon className="w-6 h-6 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-green-800 text-sm uppercase tracking-tight mb-1">Đã gửi email xác minh</p>
                    <p className="text-sm text-green-700">{createSuccess}</p>
                  </div>
                </div>
                <div className="flex gap-4 pt-2">
                  <button onClick={() => { setIsModalOpen(false); setCreateSuccess(''); }} className="flex-1 py-2.5 text-gray-500 font-bold uppercase text-xs">Đóng</button>
                  <button onClick={() => setCreateSuccess('')} className="flex-[2] py-2.5 bg-[#7598C1] text-black rounded-lg font-black uppercase text-xs tracking-widest hover:bg-[#5DA2D5]">Thêm Người Khác</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
                  <EnvelopeIcon className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs font-bold text-blue-700">
                    Một email xác minh sẽ được gửi. Người dùng phải xác minh trước khi đăng nhập.
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Địa chỉ Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg mt-1 outline-none focus:border-blue-400 text-gray-700 font-bold"
                    placeholder="example@mail.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Mật khẩu (Tùy chọn)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg mt-1 outline-none focus:border-blue-400 text-gray-700 font-bold"
                    placeholder="Mặc định: Kindlink@123"
                  />
                  <p className="text-[10px] text-gray-400 mt-1 italic">Hệ thống sẽ gửi email thông báo tài khoản & mật khẩu cho người dùng.</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-400 font-bold uppercase text-xs">Hủy bỏ</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-2.5 bg-[#7598C1] text-black rounded-lg font-black uppercase text-xs tracking-widest hover:bg-[#5DA2D5] shadow-lg">
                    {isSubmitting ? 'Đang gửi…' : 'Gửi lời mời'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── DETAIL SLIDE-OVER ── */}
      {isDetailOpen && selectedUser && (
        <div
          className="fixed inset-0 z-[110] flex justify-end bg-black/30 backdrop-blur-sm"
          onClick={() => setIsDetailOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl h-screen shadow-2xl overflow-y-auto flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 bg-[#7598C1] text-black flex items-center justify-between">
              <div className="flex items-center gap-4">
                <UserAvatar role={selectedUser.rawRole} src={selectedUser.avatarUrl} size="lg" />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedUser.username}</h2>
                  <p className="font-bold opacity-70 text-sm">{selectedUser.email}</p>
                  <p className="text-xs font-black opacity-80 uppercase mt-0.5">{selectedUser.role}</p>
                </div>
              </div>

              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white/20 rounded-lg">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex border-b px-8 gap-6 bg-gray-50/50 overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Tổng quan' },
                { id: 'campaigns', label: 'Chiến dịch' },
                { id: 'donations', label: 'Quyên góp' },
                { id: 'activity', label: 'Hoạt động' },
                ...(isSuperAdmin && (selectedUser.role === 'Admin' || selectedUser.role === 'ADMIN') ? [{ id: 'permissions', label: 'Phân quyền' }] : []),
                { id: 'reports', label: 'Báo cáo' }
              ].map((tab) => (
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
                        <p className="text-sm italic font-medium">"{selectedUser.lockReason}"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'activity' && (
                <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pl-8 pt-2">
                  {selectedUser.actionLogs?.map((log: any) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[41px] top-1 bg-white border-2 border-slate-900 w-4 h-4 rounded-full shadow-sm" />
                      <p className="text-sm font-black text-gray-800 uppercase">{log.action}</p>
                      <p className="text-[12px] text-gray-500 mt-1">"{log.details}"</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-1">
                        {new Date(log.createdAt).toLocaleString()} · {log.ipAddress || 'INTERNAL'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === 'permissions' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-4">
                    <ShieldExclamationIcon className="w-6 h-6 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Lưu ý quan trọng</p>
                      <p className="text-sm text-amber-800 leading-relaxed mt-1">
                        Thay đổi quyền hạn sẽ có hiệu lực ngay lập tức. Hãy cẩn thận khi cấp các quyền liên quan đến <b>Tài chính</b> và <b>Hệ thống</b>.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {PermissionGroups.map((group) => (
                      <div key={group.name} className="space-y-3">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">{group.name}</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {group.permissions.map((perm) => {
                            const isChecked = selectedUser.permissions?.includes(perm.key);
                            return (
                              <label
                                key={perm.key}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${isChecked
                                  ? 'bg-blue-50 border-blue-200 shadow-sm'
                                  : 'bg-white border-gray-100 hover:border-gray-200'
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300'}`}>
                                    {isChecked && <CheckCircleIcon className="w-4 h-4" />}
                                  </div>
                                  <span className={`text-sm font-bold ${isChecked ? 'text-blue-900' : 'text-gray-600'}`}>{perm.label}</span>
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const current = selectedUser.permissions || [];
                                    const next = e.target.checked
                                      ? [...current, perm.key]
                                      : current.filter((k: string) => k !== perm.key);
                                    handleUpdatePermissions(selectedUser.id, next);
                                  }}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              {/* Lock/Unlock: ADMIN chỉ thao tác với USER/ORGANIZER */}
              {(isSuperAdmin || ROLE_LEVEL[selectedUser.role?.toUpperCase?.().replace(' ', '_')] < ROLE_LEVEL['ADMIN']) && (
                <button
                  onClick={() => openConfirmModal(selectedUser)}
                  className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${selectedUser.isLocked ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}
                >
                  {selectedUser.isLocked
                    ? <><LockOpenIcon className="w-5 h-5" /> Khôi phục truy cập</>
                    : <><LockClosedIcon className="w-5 h-5" /> Khóa tài khoản</>}
                </button>
              )}

              {/* Upgrade to Admin: chỉ SUPER_ADMIN và target chưa là ADMIN/SUPER_ADMIN */}
              {isSuperAdmin && selectedUser.role !== 'Admin' && selectedUser.role !== 'Super Admin' && selectedUser.role !== 'ADMIN' && selectedUser.role !== 'SUPER_ADMIN' && (
                <button
                  onClick={() => { setIsDetailOpen(false); setUpgradeModal({ isOpen: true, user: selectedUser }); }}
                  className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:bg-purple-700"
                >
                  <ArrowUpCircleIcon className="w-5 h-5" /> Nâng cấp lên Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
