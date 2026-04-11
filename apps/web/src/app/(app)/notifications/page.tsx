'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    BellIcon,
    ArchiveBoxArrowDownIcon,
    MagnifyingGlassIcon,
    CheckCircleIcon,
    FunnelIcon,
    CalendarDaysIcon,
    ChevronUpDownIcon,
    InboxIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

import { API_BASE_URL } from '@/lib/constants/endpoints';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

type SortOrder = 'newest' | 'oldest';

function formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatFullDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const ITEMS_PER_PAGE = 10;

// Pagination helper
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

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterRead, sortOrder]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        try {
            const token = localStorage.getItem('accessToken');
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const processed = useMemo(() => {
        let list = [...notifications];

        // Filter by read state
        if (filterRead === 'unread') list = list.filter((n) => !n.isRead);
        if (filterRead === 'read') list = list.filter((n) => n.isRead);

        // Search
        const q = search.trim().toLowerCase();
        if (q) {
            list = list.filter(
                (n) =>
                    n.title.toLowerCase().includes(q) ||
                    n.message.toLowerCase().includes(q)
            );
        }

        // Sort
        list.sort((a, b) => {
            const diff =
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? -diff : diff;
        });

        return list;
    }, [notifications, search, sortOrder, filterRead]);

    const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE);
    const paginatedNotifications = processed.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getTypeStyle = (type: string) => {
        if (type.includes('CAMPAIGN'))
            return {
                bg: 'bg-orange-50',
                text: 'text-orange-500',
                border: 'border-orange-200',
                icon: <ArchiveBoxArrowDownIcon className="w-5 h-5" />,
                badge: 'bg-orange-100 text-orange-600',
                label: 'Campaign',
            };
        return {
            bg: 'bg-blue-50',
            text: 'text-blue-500',
            border: 'border-blue-200',
            icon: <BellIcon className="w-5 h-5" />,
            badge: 'bg-blue-100 text-blue-600',
            label: 'General',
        };
    };

    return (
        <div className="max-w-5xl mx-auto">
            {/* ── Header ── */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#E0F0FA] flex items-center justify-center">
                            <BellIcon className="w-6 h-6 text-[#2ba6e1]" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                Notifications
                            </h1>
                            <p className="text-sm text-gray-400 mt-0.5">
                                {unreadCount > 0
                                    ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                    : 'All caught up!'}
                            </p>
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-2 text-sm font-semibold text-[#2ba6e1] hover:text-blue-700 bg-[#E0F0FA] hover:bg-blue-100 px-4 py-2 rounded-full transition-all"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            {/* ── Controls ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search notifications…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-[25px] sm:h-[35px] pl-10 pr-4 rounded-2xl border border-gray-200 bg-white text-[11px] sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2ba6e1]/30 focus:border-[#2ba6e1] transition-all"
                    />
                </div>

                {/* Read filter */}
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-2xl p-1">
                    {(['all', 'unread', 'read'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterRead(f)}
                            className={`px-4 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filterRead === f
                                ? 'bg-[#2ba6e1] text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-800'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Sort */}
                <button
                    onClick={() =>
                        setSortOrder((prev) => (prev === 'newest' ? 'oldest' : 'newest'))
                    }
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-bold text-gray-600 hover:border-[#2ba6e1] hover:text-[#2ba6e1] transition-all whitespace-nowrap"
                >
                    <ChevronUpDownIcon className="w-4 h-4" />
                    {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                </button>
            </div>

            {/* ── Stats strip ── */}
            {!isLoading && notifications.length > 0 && (
                <div className="flex items-center gap-4 mb-5 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                        <FunnelIcon className="w-3.5 h-3.5" />
                        Showing <strong className="text-gray-700">{processed.length}</strong> of{' '}
                        <strong className="text-gray-700">{notifications.length}</strong>
                    </span>
                    <span className="h-3 w-px bg-gray-200" />
                    <span>
                        <strong className="text-[#2ba6e1]">{unreadCount}</strong> unread
                    </span>
                </div>
            )}

            {/* ── List ── */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2ba6e1]" />
                    <p className="text-sm text-gray-400 font-medium">Loading notifications…</p>
                </div>
            ) : processed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 text-center">
                    <InboxIcon className="w-16 h-16 text-gray-300" />
                    <p className="text-base font-semibold text-gray-500">No notifications found</p>
                    <p className="text-sm text-gray-400">
                        {search ? 'Try a different search term.' : 'You\'re all caught up!'}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {paginatedNotifications.map((n) => {
                        const style = getTypeStyle(n.type);
                        return (
                            <div
                                key={n.id}
                                onClick={() => {
                                    if (!n.isRead) markAsRead(n.id);
                                    if (n.link) window.location.href = n.link;
                                }}
                                className={`group flex gap-4 p-5 rounded-3xl border transition-all cursor-pointer ${n.isRead
                                    ? 'bg-white border-gray-100 opacity-70 hover:opacity-100 hover:border-gray-200 hover:shadow-sm'
                                    : `bg-gradient-to-r from-blue-50/60 to-white border-[#2ba6e1]/30 shadow-sm hover:shadow-md hover:border-[#2ba6e1]/60`
                                    }`}
                            >
                                {/* Icon */}
                                <div
                                    className={`shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center border ${style.bg} ${style.text} ${style.border}`}
                                >
                                    {style.icon}
                                </div>

                                {/* Body */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p
                                                className={`text-sm font-bold leading-snug ${n.isRead ? 'text-gray-600' : 'text-gray-900'
                                                    }`}
                                            >
                                                {n.title}
                                            </p>
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${style.badge}`}
                                            >
                                                {style.label}
                                            </span>
                                        </div>

                                        {/* Unread dot / read icon */}
                                        <div className="shrink-0 mt-0.5">
                                            {n.isRead ? (
                                                <CheckCircleSolid className="w-4 h-4 text-gray-300" />
                                            ) : (
                                                <span className="block w-2.5 h-2.5 rounded-full bg-[#2ba6e1] animate-pulse" />
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">
                                        {n.message}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                                            <span title={formatFullDate(n.createdAt)}>
                                                {formatRelativeTime(n.createdAt)}
                                            </span>
                                            <span className="text-gray-300">·</span>
                                            <span className="hidden sm:inline text-gray-400">
                                                {formatFullDate(n.createdAt)}
                                            </span>
                                        </div>

                                        {!n.isRead && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(n.id);
                                                }}
                                                className="text-[10px] font-bold text-[#2ba6e1] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-all"
                                            >
                                                Mark as read
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination Component */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-8 mb-8 flex-wrap">
                            {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                                typeof item === 'number' ? (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(item)}
                                        className={`
                                            w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all
                                            ${currentPage === item
                                                ? "bg-[#2ba6e1] text-white shadow-lg shadow-blue-200 scale-110"
                                                : "border border-gray-200 text-gray-500 hover:bg-blue-50 hover:text-[#2ba6e1] hover:border-blue-300"
                                            }
                                        `}
                                    >
                                        {item}
                                    </button>
                                ) : (
                                    <span key={idx} className="px-2 text-gray-400">{item}</span>
                                )
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
