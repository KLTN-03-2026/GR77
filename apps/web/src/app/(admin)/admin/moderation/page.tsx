'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  NewspaperIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getToken() {
  return localStorage.getItem('adminAccessToken') || '';
}

function authFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
}

// ── Toast ─────────────────────────────────────────────────────────
type ToastType = 'success' | 'error';
function Toast({ msg, type, onClose }: { msg: string; type: ToastType; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-bold text-sm transition-all ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
      {type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationCircleIcon className="w-5 h-5" />}
      {msg}
      <button onClick={onClose}><XMarkIcon className="w-4 h-4 ml-1 opacity-70 hover:opacity-100" /></button>
    </div>
  );
}

// ── Confirm Dialog ─────────────────────────────────────────────────
function ConfirmDialog({ msg, onConfirm, onCancel }: { msg: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full mx-4">
        <div className="flex items-start gap-3 mb-5">
          <ExclamationTriangleIcon className="w-7 h-7 text-red-500 shrink-0 mt-0.5" />
          <p className="text-gray-800 font-semibold leading-snug">{msg}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition">Hủy</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 font-bold text-sm text-white hover:bg-red-700 transition">Xác nhận xóa</button>
        </div>
      </div>
    </div>
  );
}

// ── Pagination ─────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition">
        <ChevronLeftIcon className="w-4 h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onChange(p)} className={`w-9 h-9 rounded-xl font-bold text-sm transition ${p === page ? 'bg-[#7598C1] text-white shadow' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
      ))}
      <button disabled={page >= totalPages} onClick={() => onChange(page + 1)} className="p-2 rounded-lg border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition">
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Tab: Bình luận ─────────────────────────────────────────────────
function CommentsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; content: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);

  const fetchData = useCallback(async (pg = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '12' });
      if (search) params.set('q', search);
      const res = await authFetch(`${API}/comments/admin?${params}`);
      if (!res.ok) throw new Error('Lỗi tải dữ liệu');
      const data = await res.json();
      setItems(data.items);
      setMeta(data.meta);
    } catch { setToast({ msg: 'Không thể tải danh sách bình luận', type: 'error' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page, q); }, [page]);

  const handleSearch = () => { setPage(1); fetchData(1, q); };

  const handleDelete = async (id: string) => {
    try {
      const res = await authFetch(`${API}/comments/admin/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(c => c.id !== id));
      setMeta(prev => ({ ...prev, total: prev.total - 1 }));
      setToast({ msg: 'Đã xóa bình luận thành công', type: 'success' });
    } catch { setToast({ msg: 'Xóa thất bại, vui lòng thử lại', type: 'error' }); }
    finally { setConfirm(null); }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          msg={`Xóa bình luận: "${confirm.content.substring(0, 60)}..."? Hành động này không thể hoàn tác và sẽ gửi cảnh báo tới người dùng.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Search Bar */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nội dung bình luận..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
        <button onClick={handleSearch} className="px-5 py-2.5 bg-[#7598C1] text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition">Tìm</button>
        <button onClick={() => { setQ(''); setPage(1); fetchData(1, ''); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Tổng: {meta.total} bình luận đang hoạt động</p>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <ArrowPathIcon className="w-6 h-6 animate-spin mr-2" /> Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <ChatBubbleLeftRightIcon className="w-14 h-14 mb-3" />
          <p className="font-semibold text-gray-400">Không có bình luận nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(c => (
            <div key={c.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-4 hover:shadow-sm transition group">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden border border-gray-200">
                {c.author.avatarUrl
                  ? <img src={c.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <UserCircleIcon className="w-6 h-6 text-gray-400" />}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-sm text-gray-800">{c.author.name}</span>
                  <span className="text-xs text-gray-400">{c.author.email}</span>
                  {c.reportCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 text-[10px] font-black border border-red-100">
                      ⚑ {c.reportCount} báo cáo
                    </span>
                  )}
                  {c.parentId && <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold border border-purple-100">Trả lời</span>}
                </div>
                <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 mb-2">{c.content}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>📁 {c.campaignTitle}</span>
                  <span>•</span>
                  <span>{new Date(c.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
              {/* Action */}
              <div className="shrink-0 flex items-start pt-1">
                <button
                  onClick={() => setConfirm({ id: c.id, content: c.content })}
                  title="Xóa bình luận vi phạm"
                  className="p-2 rounded-xl text-gray-300 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={p => setPage(p)} />
    </div>
  );
}

// ── Tab: Bài cập nhật Campaign ─────────────────────────────────────
function CampaignNewsTab() {
  const [items, setItems] = useState<any[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState<{ id: string; title: string } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchData = useCallback(async (pg = 1, search = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: '10' });
      if (search) params.set('q', search);
      const res = await authFetch(`${API}/campaigns/admin/news?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setItems(data.items);
      setMeta(data.meta);
    } catch { setToast({ msg: 'Không thể tải danh sách bài cập nhật', type: 'error' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(page, q); }, [page]);

  const handleSearch = () => { setPage(1); fetchData(1, q); };

  const handleDelete = async (id: string) => {
    try {
      const res = await authFetch(`${API}/campaigns/admin/news/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setItems(prev => prev.filter(n => n.id !== id));
      setMeta(prev => ({ ...prev, total: prev.total - 1 }));
      setToast({ msg: 'Đã xóa bài cập nhật thành công', type: 'success' });
    } catch { setToast({ msg: 'Xóa thất bại, vui lòng thử lại', type: 'error' }); }
    finally { setConfirm(null); }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && (
        <ConfirmDialog
          msg={`Xóa bài cập nhật: "${confirm.title}"? Hành động này không thể hoàn tác và sẽ gửi cảnh báo tới người tạo chiến dịch.`}
          onConfirm={() => handleDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề hoặc nội dung bài cập nhật..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </div>
        <button onClick={handleSearch} className="px-5 py-2.5 bg-[#7598C1] text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition">Tìm</button>
        <button onClick={() => { setQ(''); setPage(1); fetchData(1, ''); }} className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition">
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Tổng: {meta.total} bài cập nhật</p>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <ArrowPathIcon className="w-6 h-6 animate-spin mr-2" /> Đang tải...
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <NewspaperIcon className="w-14 h-14 mb-3" />
          <p className="font-semibold text-gray-400">Không có bài cập nhật nào</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div key={n.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-sm transition">
              <div className="p-4 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200 overflow-hidden">
                  {n.author?.avatarUrl
                    ? <img src={n.author.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <UserCircleIcon className="w-6 h-6 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm mb-0.5">{n.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-600">{n.author?.name || 'N/A'}</span>
                    <span>•</span>
                    <span>📁 {n.campaignTitle}</span>
                    <span>•</span>
                    <span>{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                  </div>
                  <p className={`text-sm text-gray-600 leading-relaxed ${expanded === n.id ? '' : 'line-clamp-2'}`}>{n.content}</p>
                  {n.content.length > 100 && (
                    <button onClick={() => setExpanded(expanded === n.id ? null : n.id)} className="text-xs text-blue-500 hover:underline mt-1">
                      {expanded === n.id ? 'Thu gọn ▲' : 'Xem thêm ▼'}
                    </button>
                  )}
                </div>
                <div className="shrink-0 flex items-start pt-1">
                  <button
                    onClick={() => setConfirm({ id: n.id, title: n.title })}
                    title="Xóa bài cập nhật vi phạm"
                    className="p-2 rounded-xl text-gray-300 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={meta.page} totalPages={meta.totalPages} onChange={p => setPage(p)} />
    </div>
  );
}

// ── Tab: Ảnh người dùng ─────────────────────────────────────────────
function UserAvatarsTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState<{ userId: string; name: string; field: 'avatar' | 'cover' } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API}/users`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      // Chỉ lấy user có avatar hoặc cover image
      setUsers(data.filter((u: any) => u.profile?.avatarUrl || u.profile?.coverImageUrl));
    } catch { setToast({ msg: 'Không thể tải danh sách người dùng', type: 'error' }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, []);

  const handleReset = async (userId: string, field: 'avatar' | 'cover') => {
    setResetting(`${userId}-${field}`);
    try {
      const res = await authFetch(`${API}/users/${userId}/reset-avatar`, {
        method: 'POST',
        body: JSON.stringify(field === 'avatar' ? { avatar: true } : { cover: true }),
      });
      if (!res.ok) throw new Error();
      setUsers(prev => prev.map(u => {
        if (u.id !== userId) return u;
        const newProfile = { ...u.profile };
        if (field === 'avatar') newProfile.avatarUrl = null;
        if (field === 'cover') newProfile.coverImageUrl = null;
        // Remove user from list if no more images
        if (!newProfile.avatarUrl && !newProfile.coverImageUrl) return null;
        return { ...u, profile: newProfile };
      }).filter(Boolean));
      setToast({ msg: 'Đã xóa ảnh vi phạm thành công', type: 'success' });
    } catch { setToast({ msg: 'Xóa ảnh thất bại, vui lòng thử lại', type: 'error' }); }
    finally { setResetting(null); setConfirmReset(null); }
  };

  return (
    <div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirmReset && (
        <ConfirmDialog
          msg={`Xóa ${confirmReset.field === 'avatar' ? 'ảnh đại diện' : 'ảnh bìa'} của "${confirmReset.name}"? Ảnh sẽ được đặt lại về mặc định.`}
          onConfirm={() => handleReset(confirmReset.userId, confirmReset.field)}
          onCancel={() => setConfirmReset(null)}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
          {users.length} người dùng có ảnh cần xem xét
        </p>
        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
          <ArrowPathIcon className="w-4 h-4" /> Làm mới
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <ArrowPathIcon className="w-6 h-6 animate-spin mr-2" /> Đang tải...
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-300">
          <UserCircleIcon className="w-14 h-14 mb-3" />
          <p className="font-semibold text-gray-400">Không có ảnh nào để xem xét</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map(u => (
            <div key={u.id} className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-sm transition">
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                  {u.profile?.avatarUrl
                    ? <img src={u.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <UserCircleIcon className="w-full h-full text-gray-300" />}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">
                    {u.profile?.firstName ? `${u.profile.firstName} ${u.profile.lastName || ''}`.trim() : u.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                <span className="ml-auto text-xs font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-500">{u.role}</span>
              </div>

              <div className="space-y-2.5">
                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                    {u.profile?.avatarUrl
                      ? <img src={u.profile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300"><PhotoIcon className="w-6 h-6" /></div>}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ảnh đại diện</p>
                    {u.profile?.avatarUrl ? (
                      <button
                        onClick={() => setConfirmReset({ userId: u.id, name: u.username, field: 'avatar' })}
                        disabled={resetting === `${u.id}-avatar`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        {resetting === `${u.id}-avatar` ? 'Đang xóa...' : 'Xóa ảnh vi phạm'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Không có ảnh</span>
                    )}
                  </div>
                </div>

                {/* Cover */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl border border-gray-200 overflow-hidden bg-gray-50 shrink-0">
                    {u.profile?.coverImageUrl
                      ? <img src={u.profile.coverImageUrl} alt="cover" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300"><PhotoIcon className="w-6 h-6" /></div>}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Ảnh bìa</p>
                    {u.profile?.coverImageUrl ? (
                      <button
                        onClick={() => setConfirmReset({ userId: u.id, name: u.username, field: 'cover' })}
                        disabled={resetting === `${u.id}-cover`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition disabled:opacity-50"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                        {resetting === `${u.id}-cover` ? 'Đang xóa...' : 'Xóa ảnh vi phạm'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Không có ảnh</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────
const TABS = [
  { id: 'comments', label: 'Bình luận', icon: ChatBubbleLeftRightIcon, desc: 'Kiểm duyệt và xóa bình luận vi phạm' },
  { id: 'news', label: 'Bài cập nhật', icon: NewspaperIcon, desc: 'Kiểm duyệt bài cập nhật chiến dịch' },
  { id: 'avatars', label: 'Ảnh người dùng', icon: PhotoIcon, desc: 'Xóa ảnh đại diện/ảnh bìa phản cảm' },
];

export default function AdminModerationPage() {
  const [activeTab, setActiveTab] = useState('comments');

  const activeTabInfo = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="space-y-6 pb-20">
      {/* Banner */}
      <div className="flex items-center gap-3 p-3 rounded-2xl border text-sm font-bold bg-[#D0E3F9]/50 border-blue-200 text-blue-800">
        <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
        Kiểm duyệt nội dung — Chủ động phát hiện và xử lý nội dung vi phạm (bình luận, bài cập nhật, ảnh phản cảm) trước khi ảnh hưởng đến cộng đồng.
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-gray-100">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2.5 px-4 py-4 text-sm font-bold transition-all border-b-2 ${isActive
                  ? 'border-[#7598C1] text-[#4a6fa5] bg-blue-50/50'
                  : 'border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-[#7598C1]' : ''}`} style={{ width: '18px', height: '18px' }} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Header */}
        <div className="px-6 pt-5 pb-1">
          <div className="flex items-center gap-2 mb-1">
            <activeTabInfo.icon className="w-5 h-5 text-[#7598C1]" />
            <h2 className="text-base font-black text-gray-800">{activeTabInfo.label}</h2>
          </div>
          <p className="text-xs text-gray-400 mb-4">{activeTabInfo.desc}</p>
        </div>

        {/* Tab Content */}
        <div className="px-6 pb-6">
          {activeTab === 'comments' && <CommentsTab />}
          {activeTab === 'news' && <CampaignNewsTab />}
          {activeTab === 'avatars' && <UserAvatarsTab />}
        </div>
      </div>
    </div>
  );
}
