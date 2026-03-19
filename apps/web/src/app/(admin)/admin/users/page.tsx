'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  PencilSquareIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  XMarkIcon,
  CheckBadgeIcon,
  IdentificationIcon,
  CreditCardIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FlagIcon,
  ShieldExclamationIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';
import { UserGroupIcon, UserIcon } from '@heroicons/react/24/solid';

// Interface 
export interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'Donor' | 'Admin' | 'Organizer';
  walletAddress: string;
  kycStatus: 'Verified' | 'Pending' | 'Rejected' | 'Unverified';
  totalContributed: number;
  avatarUrl?: string;
  createdAt?: string;
  isLocked?: boolean;
}

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

// ── STAT CARD ──
function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-[#7598C1] rounded-3xl px-6 py-4.5 flex items-center space-x-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="bg-white/15 p-3 rounded-2xl group-hover:bg-white/20 transition-colors text-black flex items-center justify-center">
        <div className="w-9 h-9">{icon}</div>
      </div>
      <div className="text-black">
        <p className="text-lg font-bold tracking-wide uppercase opacity-100">{label}</p>
        <h2 className="text-4xl font-black mt-1 tabular-nums">{value}</h2>
      </div>
    </div>
  );
}

// ── AVATAR ──
function Avatar({ role }: { role: string }) {
  const isAdmin = role === 'Admin';
  if (!isAdmin) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 overflow-hidden shadow-inner border border-gray-100 shrink-0">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" /></svg>
      </div>
    );
  }
  return (
    <div className="relative shrink-0 group">
      <div className="absolute inset-[-2px] rounded-full bg-gradient-to-tr from-[#FF3D77] via-[#338AFF] to-[#7B2CFE] opacity-70 blur-[1px] animate-spin group-hover:opacity-100 transition-all duration-700 pointer-events-none" style={{ animationDuration: '6s' }}></div>
      <div className="relative w-9 h-9 rounded-full bg-white p-[1px] shadow-sm"><div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden"><svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg></div></div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'USER' });

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: '', name: '', email: '', role: '' });
  const [activeTab, setActiveTab] = useState('overview');

  // New Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    user: UserData | null;
    action: 'lock' | 'unlock';
    reason: string;
  }>({ isOpen: false, user: null, action: 'lock', reason: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}` },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create user');
      setIsModalOpen(false);
      setFormData({ email: '', password: '', role: 'USER' });
      await fetchUsers();
    } catch (err: any) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`http://localhost:3001/users/${editFormData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}` },
        body: JSON.stringify({ email: editFormData.email, username: editFormData.name, role: editFormData.role }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setIsEditOpen(false);
      await fetchUsers();
    } catch (err: any) { alert(err.message); } finally { setIsSubmitting(false); }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/users/${id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}` } });
      const data = await res.json();
      setSelectedUser(data);
      setIsDetailOpen(true);
      setActiveTab('overview');
    } catch (err: any) { alert(err.message); }
  };

  const handleEditOpen = (user: UserData) => {
    setEditFormData({ id: user.id, name: user.name, email: user.email, role: user.role === 'Admin' ? 'ADMIN' : (user.role === 'Organizer' ? 'ORGANIZER' : 'USER') });
    setIsEditOpen(true);
  };

  const openConfirmModal = (user: UserData) => {
    setConfirmModal({
      isOpen: true,
      user,
      action: user.isLocked ? 'unlock' : 'lock',
      reason: ''
    });
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
      const res = await fetch(`http://localhost:3001/users/${user.id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('adminAccessToken')}` },
        body: action === 'lock' ? JSON.stringify({ reason }) : undefined,
      });
      if (!res.ok) throw new Error(`Failed to ${action} user`);

      setConfirmModal({ ...confirmModal, isOpen: false });
      await fetchUsers();
      if (isDetailOpen && selectedUser?.id === user.id) handleViewDetails(user.id);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = q === '' || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || user.role.toLowerCase().includes(q);
      const matchesRole = roleFilter === 'All' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || (statusFilter === 'Locked' ? user.isLocked : !user.isLocked);
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-8 pb-20">

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <StatCard label="Total Users" value={users.length.toLocaleString()} icon={<UserGroupIcon />} />
        <StatCard label="Restricted Accounts" value={users.filter(u => u.isLocked).length.toLocaleString()} icon={<LockClosedIcon />} />
      </div>

      {/* ── USERS TABLE ── */}
      <div className="bg-white border border-gray-300 rounded-xl overflow-hidden shadow-sm">
        {/* Filters Header */}
        <div className="flex flex-wrap items-center gap-3 p-3 bg-[#f8f9fa] border-b border-gray-300">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-[#2ba6e1]" strokeWidth={2.5} />
              </div>
              <input type="text" className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg w-64 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-gray-600 font-medium placeholder:text-gray-400" placeholder="Search Identity..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
            </div>

            <div className="relative">
              <select className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                <option value="All">Role: All</option><option value="Donor">Donor</option><option value="Admin">Admin</option><option value="Organizer">Organizer</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400"><ChevronDownIcon className="h-4 w-4" /></div>
            </div>

            <div className="relative">
              <select className="py-1.5 pl-3 pr-8 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700 outline-none hover:bg-white focus:ring-2 focus:ring-blue-100 cursor-pointer appearance-none" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                <option value="All">Status: All</option><option value="Active">Operational</option><option value="Locked">Restricted</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-gray-400"><ChevronDownIcon className="h-4 w-4" /></div>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="ml-auto bg-[#7598C1] hover:bg-[#5DA2D5] text-black px-4 py-1.5 rounded-md text-sm font-medium shadow-sm flex items-center gap-1.5"><PlusIcon className="h-4 w-4 stroke-[2.5]" /> Add Member</button>
        </div>

        <div className="overflow-x-auto">
          {paginatedUsers.length > 0 ? (
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-300">
                  <th className="px-5 py-3 font-bold text-black border-r border-gray-300">Identity</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Access Role</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Funds</th>
                  <th className="px-4 py-3 font-bold text-black border-r border-gray-300">Security</th>
                  <th className="px-4 py-3 font-bold text-black text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
                {loading ? (
                  <tr><td colSpan={5} className="px-5 py-20 text-center text-gray-400 italic">Syncing base...</td></tr>
                ) : paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-300 bg-[#fbfbfb] hover:bg-gray-50 transition-colors group cursor-default">
                    <td className="px-5 py-3 border-r border-gray-300"><div className="flex items-center gap-3"><Avatar role={user.role} /><div><p className="font-bold text-gray-800 leading-tight">{user.name}</p><p className="text-[12px] text-gray-500 mt-0.5">{user.email}</p></div></div></td>
                    <td className="px-4 py-3 text-gray-800 border-r border-gray-300 font-medium">{user.role}</td>
                    <td className="px-4 py-3 text-gray-800 border-r border-gray-300 font-bold tabular-nums">${user.totalContributed.toLocaleString()}</td>
                    <td className="px-4 py-3 border-r border-gray-300"><span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-tight ${user.isLocked ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#7BC712] text-black'}`}>{user.isLocked ? 'Restricted' : 'Operational'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => handleViewDetails(user.id)} className="text-blue-500 hover:text-blue-700 transition-colors"><EyeIcon className="w-5 h-5" /></button>
                        <button onClick={() => handleEditOpen(user)} className="text-gray-400 hover:text-orange-500 transition-colors"><PencilSquareIcon className="w-5 h-5" /></button>
                        <button onClick={() => openConfirmModal(user)} className={`${user.isLocked ? 'text-green-500' : 'text-red-400'}`}>
                          {user.isLocked ? <LockOpenIcon className="w-5 h-5" /> : <LockClosedIcon className="w-5 h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-32 flex flex-col items-center justify-center text-gray-400"><MagnifyingGlassIcon className="h-16 w-16 mb-4 opacity-20" /><p className="text-xl font-medium">No results found.</p></div>
          )}
        </div>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 0 && (
        <div className="flex flex-col items-center gap-4 mt-8">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest opacity-60">Showing {filteredUsers.length} members matching criteria</p>
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

      {/* ── SECURITY CONFIRMATION MODAL (Lock/Unlock) ── */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-gray-100 transform animate-in zoom-in duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${confirmModal.action === 'lock' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {confirmModal.action === 'lock' ? <ShieldExclamationIcon className="w-10 h-10" /> : <ShieldCheckIcon className="w-10 h-10" />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight uppercase tracking-tight">
                  {confirmModal.action === 'lock' ? 'Restrict Account' : 'Restore Access'}
                </h2>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Security Enforcement Division</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-6">
              <div className="flex items-center gap-4">
                <Avatar role={confirmModal.user?.role || ''} />
                <div>
                  <p className="font-black text-gray-900">{confirmModal.user?.name}</p>
                  <p className="text-sm font-bold text-gray-500">{confirmModal.user?.email}</p>
                </div>
              </div>
            </div>

            {confirmModal.action === 'lock' ? (
              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-700 leading-relaxed">
                  You are about to <span className="text-red-600 font-black underline">RESTRICT</span> this account. An automated notification will be sent to the member explaining the reason.
                </p>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Suspension Reason (Required)</label>
                  <textarea
                    value={confirmModal.reason}
                    onChange={e => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                    placeholder="Describe the violation or reason for restriction..."
                    className="w-full h-32 px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-red-100 focus:border-red-400 outline-none transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-700 leading-relaxed">
                  Confirm account <span className="text-green-600 font-black underline">RESTORATION</span>. The member will be notified via email and will regain full access to the platform immediately.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-900 transition-colors"
              >
                Abort Action
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleToggleLock}
                className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all transform active:scale-95 ${confirmModal.action === 'lock'
                    ? 'bg-red-600 text-white shadow-red-200 hover:bg-red-700'
                    : 'bg-green-600 text-white shadow-green-200 hover:bg-green-700'
                  }`}
              >
                {isSubmitting ? 'Syncing...' : (confirmModal.action === 'lock' ? 'Lock Account' : 'Unlock Account')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE USER MODAL ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-[#7598C1] pl-3 uppercase tracking-tight">Onboard Member</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-400 uppercase">Primary Email</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg mt-1 outline-none focus:border-blue-400" /></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Privilege Level</label><select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2 border border-gray-200 rounded-lg mt-1 bg-white outline-none focus:border-blue-400"><option value="USER">Donor</option><option value="ORGANIZER">Organizer</option><option value="ADMIN">Administrator</option></select></div>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-gray-400 font-bold uppercase text-xs">Abort</button><button type="submit" disabled={isSubmitting} className="flex-[2] py-2.5 bg-[#7598C1] text-black rounded-lg font-black uppercase text-xs tracking-widest hover:bg-[#5DA2D5] shadow-lg">{isSubmitting ? 'Syncing...' : 'Authorize member'}</button></div>
            </form>
          </div>
        </div>
      )}

      {/* ── SLIDE-OVER DETAIL ── */}
      {isDetailOpen && selectedUser && (
        <div className="fixed inset-0 z-[110] flex justify-end bg-black/30 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl h-screen shadow-2xl overflow-y-auto flex flex-col p-0">
            <div className="p-8 bg-[#7598C1] text-black flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar role={selectedUser.role} />
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{selectedUser.username}</h2>
                  <p className="font-bold opacity-70 text-sm">{selectedUser.email}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white/20 rounded-lg"><XMarkIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex border-b px-8 gap-6 bg-gray-50/50">
              {['overview', 'campaigns', 'donations', 'activity', 'reports'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`py-4 text-xs font-black uppercase tracking-wider border-b-4 transition-all ${activeTab === tab ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>{tab}</button>
              ))}
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 border rounded-xl"><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Status</p><p className={`text-lg font-black ${selectedUser.isLocked ? 'text-red-600' : 'text-green-600'}`}>{selectedUser.isLocked ? 'RESTRICTED' : 'OPERATIONAL'}</p></div>
                    <div className="p-4 bg-gray-50 border rounded-xl"><p className="text-[10px] font-black uppercase text-gray-400 mb-1">Entity</p><p className="text-lg font-black text-gray-900">{selectedUser.role}</p></div>
                  </div>
                  {selectedUser.isLocked && <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-900"><ExclamationTriangleIcon className="w-6 h-6 shrink-0" /><div><p className="text-sm font-bold uppercase">Reason</p><p className="text-sm italic font-medium">"{selectedUser.lockReason}"</p></div></div>}
                </div>
              )}
              {activeTab === 'activity' && (
                <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pl-8 pt-2">
                  {selectedUser.actionLogs.map((log: any) => (
                    <div key={log.id} className="relative">
                      <div className="absolute -left-[41px] top-1 bg-white border-2 border-slate-900 w-4 h-4 rounded-full shadow-sm"></div>
                      <p className="text-sm font-black text-gray-800 uppercase leading-none">{log.action}</p>
                      <p className="text-[12px] text-gray-500 mt-2">"{log.details}"</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-2">{new Date(log.createdAt).toLocaleString()} • {log.ipAddress || 'INTERNAL'}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* ... other tabs ... */}
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-4">
              <button onClick={() => { openConfirmModal(selectedUser); }} className={`flex-1 py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all ${selectedUser.isLocked ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
                {selectedUser.isLocked ? <><LockOpenIcon className="w-5 h-5" /> Restore Access</> : <><LockClosedIcon className="w-5 h-5" /> Suspend Account</>}
              </button>
              <button onClick={() => { setIsDetailOpen(false); handleEditOpen(selectedUser); }} className="flex-1 py-4 bg-gray-900 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center shadow-lg hover:bg-black">Override Identity</button>
            </div>
          </div>
        </div>
      )}

      {isEditOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-l-4 border-[#7598C1] pl-3 uppercase">Adjust Identity</h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div><label className="text-xs font-bold text-gray-400 uppercase">Primary Email</label><input type="email" required value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg mt-1 focus:border-blue-400 outline-none" /></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Username / Codename</label><input type="text" required value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg mt-1 focus:border-blue-400 outline-none" /></div>
              <div><label className="text-xs font-bold text-gray-400 uppercase">Privilege Role</label><select value={editFormData.role} onChange={e => setEditFormData({ ...editFormData, role: e.target.value })} className="w-full px-4 py-2 border rounded-lg mt-1 bg-white focus:border-blue-400 outline-none"><option value="USER">Donor</option><option value="ORGANIZER">Organizer</option><option value="ADMIN">Administrator</option></select></div>
              <div className="flex gap-4 pt-4"><button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-2.5 text-gray-500 font-bold uppercase text-xs">Cancel</button><button type="submit" disabled={isSubmitting} className="flex-[2] py-2.5 bg-[#7598C1] text-black rounded-lg font-black uppercase text-xs hover:bg-[#5DA2D5] tracking-widest shadow-lg">Commit Sync</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
