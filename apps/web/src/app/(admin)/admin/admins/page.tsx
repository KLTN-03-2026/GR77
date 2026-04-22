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
    EnvelopeIcon,
    ShieldExclamationIcon as SuperAdminIcon,
    KeyIcon,
} from '@heroicons/react/24/outline';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { AdminPermission, PermissionGroups } from '@/constants/permissions';
import UserAvatar from '@/components/common/UserAvatar';

// ── Types ──────────────────────────────────────────────────────────
export interface UserData {
    id: string;
    username: string; // API returns username
    email: string;
    role: 'Admin' | 'Super Admin';
    rawRole: 'ADMIN' | 'SUPER_ADMIN';
    avatarUrl?: string;
    createdAt?: string;
    isLocked?: boolean;
    permissions?: string[];
    lockReason?: string;
}

type CallerRole = 'ADMIN' | 'SUPER_ADMIN';

// ── Utils ──────────────────────────────────────────────────────────
function decodeJwt(token: string): { role?: string; sub?: string; username?: string; permissions?: string[] } | null {
    try {
        const base64 = token.split('.')[1];
        if (!base64) return null;
        return JSON.parse(atob(base64.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}

// ── Sub-components ──────────────────────────────────────────────────
function StatCard({ label, value, icon, color = 'bg-[#7598C1]' }: { label: string; value: string; icon: React.ReactNode; color?: string }) {
    return (
        <div className={`${color} rounded-3xl px-6 py-4 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}>
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
        'Admin': 'bg-purple-50 text-purple-700 border-purple-100',
        'Super Admin': 'bg-rose-50 text-rose-700 border-rose-100',
    };
    return (
        <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight border ${styles[role] || 'bg-gray-50 text-gray-600'}`}>
            {role}
        </span>
    );
}

export default function AdminsPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [callerRole, setCallerRole] = useState<CallerRole>('ADMIN');
    const [callerId, setCallerId] = useState<string>('');

    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');

    // Create modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({ email: '', role: 'ADMIN', password: '' });
    const [createSuccess, setCreateSuccess] = useState('');

    // Detail panel
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [tempPermissions, setTempPermissions] = useState<string[]>([]);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('permissions');

    // Lock/Unlock modal
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        user: UserData | null;
        action: 'lock' | 'unlock';
        reason: string;
    }>({ isOpen: false, user: null, action: 'lock', reason: '' });

    useEffect(() => {
        const token = localStorage.getItem('adminAccessToken');
        if (token) {
            const decoded = decodeJwt(token);
            if (decoded?.role === 'SUPER_ADMIN') setCallerRole('SUPER_ADMIN');
            if (decoded?.sub) setCallerId(decoded.sub);
        }
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users?roleGroup=ADMINS`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}` },
            });
            if (!res.ok) throw new Error('Failed to fetch admins');
            setUsers(await res.json());
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const authFetch = (url: string, options: RequestInit = {}) =>
        fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('adminAccessToken')}`,
                ...(options.headers || {}),
            },
        });

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setCreateSuccess('');
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users`, {
                method: 'POST',
                body: JSON.stringify({
                    email: formData.email,
                    role: formData.role,
                    password: formData.password || undefined
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create admin');
            setCreateSuccess(`Tài khoản Admin đã được tạo cho ${formData.email}.`);
            setFormData({ email: '', role: 'ADMIN', password: '' });
            fetchAdmins();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleViewDetails = async (id: string) => {
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${id}`);
            const data = await res.json();
            setSelectedUser(data);
            setTempPermissions(data.permissions || []);
            setIsDetailOpen(true);
            setActiveTab('permissions');
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleToggleLock = async () => {
        const { user, action, reason } = confirmModal;
        if (!user) return;
        if (action === 'lock' && !reason.trim()) {
            alert('Vui lòng nhập lý do khóa');
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/users/${user.id}/${action}`, {
                method: 'POST',
                body: action === 'lock' ? JSON.stringify({ reason }) : '{}',
            });
            if (!res.ok) throw new Error(`Không thể ${action === 'lock' ? 'khóa' : 'mở khóa'} tài khoản`);
            setConfirmModal({ ...confirmModal, isOpen: false });
            fetchAdmins();
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
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data.message || 'Cập nhật quyền thất bại');

            // Refresh local data
            await fetchAdmins();
            // Update selected user info in the side panel
            setSelectedUser((prev: any) => ({ ...prev, permissions }));
            alert('Cập nhật quyền hạn thành công!');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredAdmins = useMemo(() => {
        return users.filter((user) => {
            const q = searchQuery.toLowerCase();
            const matchesSearch = !q || user.username.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
            const matchesRole = roleFilter === 'All' || user.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const isSuperAdmin = callerRole === 'SUPER_ADMIN';

    return (
        <div className="space-y-8 pb-20">
            {/* ── HEADER BADGE ── */}
            <div className="flex items-center gap-3 p-4 rounded-2xl border text-sm font-bold bg-rose-50 border-rose-200 text-rose-800 shadow-sm">
                <SuperAdminIcon className="w-5 h-5 shrink-0" />
                <div className="flex-1">
                    <p className="uppercase tracking-wider text-[11px] mb-0.5 opacity-60">Internal Management</p>
                    <p>Quản lý đội ngũ vận hành hệ thống và phân quyền truy cập chi tiết cho từng bộ phận.</p>
                </div>
            </div>

            {/* ── STATS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard label="Tổng Admin" value={users.length.toLocaleString()} icon={<UserGroupIcon />} />
                <StatCard label="Đã Khóa" value={users.filter(u => u.isLocked).length.toLocaleString()} icon={<LockClosedIcon />} color="bg-gray-200" />
            </div>

            {/* ── TABLE ── */}
            <div className="bg-white border border-gray-300 rounded-[1.5rem] overflow-hidden shadow-sm">
                <div className="flex flex-wrap items-center gap-4 p-5 bg-[#f8f9fa] border-b border-gray-300">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm admin..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl w-72 text-sm outline-none focus:border-blue-400 transition-all bg-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="relative">
                        <select
                            className="py-2 pl-3 pr-8 border border-gray-300 rounded-xl text-sm bg-white text-gray-700 outline-none hover:border-gray-400 cursor-pointer appearance-none min-w-[160px]"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="All">Tất cả vai trò</option>
                            <option value="Admin">Admin</option>
                            <option value="Super Admin">Super Admin</option>
                        </select>
                        <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={() => { setIsModalOpen(true); setCreateSuccess(''); }}
                        className="ml-auto bg-[#7598C1] hover:bg-[#5DA2D5] text-black px-6 py-2 rounded-xl text-sm font-black uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <PlusIcon className="h-5 w-5 stroke-[3]" /> Thêm Admin
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-gray-300">
                                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-400 text-[10px] text-center w-16">ID</th>
                                <th className="px-6 py-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">Danh tính</th>
                                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">Vai trò</th>
                                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">Trạng thái</th>
                                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-400 text-[10px]">Phân quyền</th>
                                <th className="px-4 py-4 font-black uppercase tracking-wider text-gray-400 text-[10px] text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-300">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-20 text-center text-gray-400 italic">Đang đồng bộ dữ liệu...</td></tr>
                            ) : filteredAdmins.length > 0 ? filteredAdmins.map((admin, index) => (
                                <tr key={admin.id} className="bg-[#fbfbfb] hover:bg-white transition-colors group">
                                    <td className="px-4 py-4 text-center font-bold text-gray-500">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <UserAvatar role={admin.rawRole} src={admin.avatarUrl} />
                                            <div>
                                                <p className="font-black text-gray-800 leading-tight text-base">{admin.username}</p>
                                                <p className="text-[12px] text-gray-500 font-medium">{admin.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4"><RoleBadge role={admin.role} /></td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight border ${admin.isLocked ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                            {admin.isLocked ? 'Bị khóa' : 'Hoạt động'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            {admin.rawRole === 'SUPER_ADMIN' ? (
                                                <span className="text-[11px] font-bold text-rose-500">Full Access</span>
                                            ) : (
                                                <div className="flex -space-x-1">
                                                    {(admin.permissions || []).slice(0, 3).map((p, i) => (
                                                        <div key={i} className="w-5 h-5 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px] font-bold text-gray-600" title={p}>
                                                            {p.charAt(0)}
                                                        </div>
                                                    ))}
                                                    {(admin.permissions?.length || 0) > 3 && (
                                                        <div className="w-5 h-5 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                                                            +{(admin.permissions?.length || 0) - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center justify-center gap-4">
                                            <button onClick={() => handleViewDetails(admin.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Xem chi tiết & Phân quyền">
                                                <EyeIcon className="w-5 h-5" />
                                            </button>
                                            {isSuperAdmin && admin.id !== callerId && (
                                                <button
                                                    onClick={() => setConfirmModal({ isOpen: true, user: admin, action: admin.isLocked ? 'unlock' : 'lock', reason: '' })}
                                                    className={`p-2 rounded-xl transition-all ${admin.isLocked ? 'text-green-600 hover:bg-green-50' : 'text-red-400 hover:bg-red-50'}`}
                                                    title={admin.isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                                                >
                                                    {admin.isLocked ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="px-6 py-32 text-center text-gray-400">Không tìm thấy quản trị viên nào phù hợp</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── CREATE ADMIN MODAL ── */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-md px-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight border-l-4 border-[#7598C1] pl-4">Thêm Quản trị viên</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XMarkIcon className="w-6 h-6 text-gray-400" /></button>
                        </div>

                        {createSuccess ? (
                            <div className="space-y-6 text-center py-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <ShieldCheckIcon className="w-12 h-12 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xl font-black text-gray-900">Thành công!</p>
                                    <p className="text-gray-500 font-medium mt-2 leading-relaxed">{createSuccess}</p>
                                </div>
                                <button onClick={() => { setIsModalOpen(false); setCreateSuccess(''); }} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Đóng</button>
                            </div>
                        ) : (
                            <form onSubmit={handleCreateAdmin} className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Email công việc</label>
                                    <div className="relative">
                                        <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        <input
                                            type="email"
                                            required
                                            placeholder="email@kindlink.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-[#7598C1] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Mật khẩu khởi tạo</label>
                                    <div className="relative">
                                        <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                                        <input
                                            type="text"
                                            placeholder="Mặc định: Admin123"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-[#7598C1] outline-none transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-2 italic font-medium">* Để trống nếu muốn dùng mật khẩu hệ thống mặc định.</p>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Vai trò trong hệ thống</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                                            className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.role === 'ADMIN' ? 'border-[#7598C1] bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-400'
                                                }`}
                                        >
                                            Admin
                                        </button>
                                        <button
                                            type="button"
                                            disabled={!isSuperAdmin}
                                            onClick={() => setFormData({ ...formData, role: 'SUPER_ADMIN' })}
                                            className={`py-4 rounded-2xl border-2 font-black text-xs uppercase tracking-widest transition-all ${formData.role === 'SUPER_ADMIN' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-100 bg-gray-50 text-gray-400 opacity-50'
                                                }`}
                                        >
                                            Super Admin
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                                        {isSubmitting ? 'Đang thực thi...' : 'Tạo tài khoản'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ── LOCK / UNLOCK MODAL ── */}
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-md px-4">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-5 mb-8">
                            <div className={`p-4 rounded-2xl ${confirmModal.action === 'lock' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {confirmModal.action === 'lock' ? <ShieldExclamationIcon className="w-10 h-10" /> : <ShieldCheckIcon className="w-10 h-10" />}
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                                    {confirmModal.action === 'lock' ? 'Khóa tài khoản' : 'Khôi phục truy cập'}
                                </h2>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1 italic">Security Enforcement</p>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-8 flex items-center gap-4">
                            <UserAvatar role={confirmModal.user?.rawRole} src={confirmModal.user?.avatarUrl} />
                            <div>
                                <p className="font-black text-gray-900">{confirmModal.user?.username}</p>
                                <p className="text-sm font-bold text-gray-500">{confirmModal.user?.email}</p>
                            </div>
                        </div>

                        {confirmModal.action === 'lock' ? (
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-gray-700">
                                    Lưu ý: Sau khi khóa, Quản trị viên này sẽ <span className="text-red-600 font-black">KHÔNG THỂ</span> đăng nhập vào hệ thống ngay lập tức.
                                </p>
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Lý do khóa tài khoản</label>
                                    <textarea
                                        value={confirmModal.reason}
                                        onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                                        placeholder="VD: Vi phạm quy tắc an toàn, Tạm dừng công tác..."
                                        className="w-full h-28 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none transition-all placeholder:text-gray-300"
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-gray-700">
                                Xác nhận khôi phục quyền truy cập cho <span className="text-green-600 font-black underline">{confirmModal.user?.username}</span>. Tài khoản sẽ có thể đăng nhập bình thường.
                            </p>
                        )}

                        <div className="grid grid-cols-2 gap-4 mt-10">
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                disabled={isSubmitting}
                                onClick={handleToggleLock}
                                className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 ${confirmModal.action === 'lock' ? 'bg-red-600 text-white hover:bg-red-800' : 'bg-green-600 text-white hover:bg-green-800'
                                    }`}
                            >
                                {isSubmitting ? 'Đang gửi...' : confirmModal.action === 'lock' ? 'Xác nhận khóa' : 'Kích hoạt lại'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── DETAIL SLIDE-OVER ── */}
            {isDetailOpen && selectedUser && (
                <div className="fixed inset-0 z-[110] flex justify-end bg-black/30 backdrop-blur-sm" onClick={() => setIsDetailOpen(false)}>
                    <div className="bg-white w-full max-w-2xl h-screen shadow-2xl flex flex-col animate-in slide-in-from-right duration-500" onClick={(e) => e.stopPropagation()}>
                        <div className="p-10 bg-[#7598C1] text-black relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />

                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <UserAvatar role={selectedUser.rawRole || selectedUser.role} src={selectedUser.avatarUrl} size="lg" />
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight">{selectedUser.username}</h2>
                                        <p className="font-bold opacity-70 text-base">{selectedUser.email}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <RoleBadge role={selectedUser.role} />
                                            <span className="text-[10px] font-black uppercase opacity-60">ID: {selectedUser.id.substring(0, 8)}...</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsDetailOpen(false)} className="p-3 bg-white/20 hover:bg-white/40 rounded-2xl transition-all"><XMarkIcon className="w-8 h-8" /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-10 space-y-10">
                                {/* Permissions section */}
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-sm font-black uppercase text-gray-400 tracking-[0.2em]">Phân quyền chi tiết</h3>
                                    </div>

                                    {selectedUser.rawRole === 'SUPER_ADMIN' ? (
                                        <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl flex gap-5">
                                            <ShieldCheckIcon className="w-10 h-10 text-rose-600 shrink-0" />
                                            <div>
                                                <p className="text-lg font-black text-rose-900 uppercase">Tài khoản tối thượng</p>
                                                <p className="text-rose-800 font-medium leading-relaxed mt-2 opacity-80 italic">
                                                    Tài khoản này là Super Admin. Theo kiến trúc hệ thống, Super Admin luôn có quyền truy cập vào tất cả các module mà không cần cấu hình thêm.
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 pb-32">
                                            {PermissionGroups.map((group) => (
                                                <div key={group.name} className="space-y-4">
                                                    <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-[#7598C1]" />
                                                        {group.name}
                                                    </h4>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        {group.permissions.map((p) => {
                                                            const hasPerm = tempPermissions.includes(p.key);
                                                            return (
                                                                <label key={p.key} className="group relative flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all hover:border-[#7598C1]">
                                                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${hasPerm ? 'bg-[#7598C1] border-[#7598C1]' : 'border-gray-200 bg-white'
                                                                        }`}>
                                                                        {hasPerm && <ShieldCheckIcon className="w-4 h-4 text-black" />}
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={hasPerm}
                                                                            onChange={(e) => {
                                                                                if (!isSuperAdmin) return;
                                                                                if (selectedUser.id === callerId) return;
                                                                                const newPerms = e.target.checked
                                                                                    ? [...tempPermissions, p.key]
                                                                                    : tempPermissions.filter((k: string) => k !== p.key);
                                                                                setTempPermissions(newPerms);
                                                                            }}
                                                                            className="sr-only"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <p className="text-[15px] font-black text-gray-800">{p.label}</p>
                                                                        <p className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mt-0.5">{p.key}</p>
                                                                    </div>
                                                                </label>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Save Button */}
                        {selectedUser.rawRole !== 'SUPER_ADMIN' && isSuperAdmin && selectedUser.id !== callerId && (
                            <div className="p-8 border-t border-gray-100 bg-white">
                                <button
                                    disabled={isSubmitting}
                                    onClick={() => handleUpdatePermissions(selectedUser.id, tempPermissions)}
                                    className="w-full py-4 bg-gray-900 text-white hover:bg-black rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang thực thi...' : 'Lưu thay đổi quyền hạn'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx global>{`
         .custom-scrollbar::-webkit-scrollbar { width: 6px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
        </div>
    );
}
