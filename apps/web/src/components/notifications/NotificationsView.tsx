'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    BellIcon,
    CheckCircleIcon,
    EllipsisHorizontalIcon,
    InboxIcon,
    ArchiveBoxArrowDownIcon,
    FlagIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';

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

function formatRelativeTime(dateString: string): string {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ITEMS_PER_PAGE = 15;

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

export function NotificationsView({ isAdmin }: { isAdmin?: boolean }) {
    const router = useRouter();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRead, setFilterRead] = useState<'all' | 'unread' | 'read'>('all');
    const [currentPage, setCurrentPage] = useState(1);

    const getToken = () => isAdmin ? localStorage.getItem('adminAccessToken') : localStorage.getItem('accessToken');

    useEffect(() => {
        setCurrentPage(1);
    }, [filterRead]);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const token = getToken();
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
            const token = getToken();
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
            const token = getToken();
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
            });
        } catch (err) {
            console.error(err);
        }
    };

    const normalizeLink = (link: string) => {
        const match = link.match(/^\/campaigns\/([a-f0-9-]+)$/i);
        if (match) return `/home/${match[1]}`;
        if (link === '/my-campaigns') return '/creator/campaigns';
        return link;
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.isRead) markAsRead(n.id);
        if (n.link) {
            let targetLink = normalizeLink(n.link);
            // Auto-append #discussion for comment notifications if not present
            if (n.type === 'COMMENT' && !targetLink.includes('#')) {
                targetLink += '#discussion';
            }
            router.push(targetLink);
        }
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const processed = useMemo(() => {
        let list = [...notifications];
        if (filterRead === 'unread') list = list.filter((n) => !n.isRead);
        if (filterRead === 'read') list = list.filter((n) => n.isRead);
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return list;
    }, [notifications, filterRead]);

    const totalPages = Math.ceil(processed.length / ITEMS_PER_PAGE);
    const paginatedNotifications = processed.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="bg-white/90 backdrop-blur-xl border-[#607895]/40 border p-5 sm:p-8 rounded-xl">
                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                    <h1 className={isAdmin
                        ? "text-2xl sm:text-2xl font-bold text-[#24305E]"
                        : "text-xl sm:text-2xl font-bold text-gray-900"
                    }>
                        Notifications
                    </h1>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="flex items-center gap-1.5 text-[11px] sm:text-sm font-semibold text-[#2ba6e1] hover:text-blue-700 transition-colors"
                        >
                            <CheckCircleIcon className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* ── Filter Tabs (FB style pills) ── */}
                <div className="flex gap-2 mb-5">
                    {(['all', 'unread', 'read'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilterRead(f)}
                            className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold capitalize transition-all ${filterRead === f
                                ? 'bg-[#E0F0FA] text-[#2ba6e1] shadow-sm'
                                : 'text-gray-500 hover:bg-gray-100/50'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* ── List ── */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2ba6e1]" />
                        <p className="text-sm text-gray-400 font-medium">Loading notifications…</p>
                    </div>
                ) : processed.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                        <InboxIcon className="w-16 h-16 text-gray-200" />
                        <p className="text-base font-semibold text-gray-400">
                            {filterRead === 'unread' ? 'No unread notifications' :
                                filterRead === 'read' ? 'No read notifications' :
                                    'No notifications yet'}
                        </p>
                    </div>
                ) : (
                    <div className="-mx-5 sm:mx-0 rounded-none sm:rounded-xl overflow-hidden bg-white/80 border-y sm:border sm:border-white/50 border-white/50">
                        {paginatedNotifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`flex items-start gap-3 px-5 py-3 sm:px-4 sm:py-4 cursor-pointer transition-all border-b border-white/100 last:border-b-0 ${n.isRead
                                    ? 'hover:bg-white/60'
                                    : 'bg-[#E0F0FA]/40 hover:bg-[#E0F0FA]/60'
                                    }`}
                            >
                                {/* Avatar / Icon */}
                                <div className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-sm ${n.type.includes('CAMPAIGN')
                                    ? 'bg-orange-50 text-orange-500 border border-orange-100'
                                    : n.type === 'REPORT'
                                        ? 'bg-red-50 text-red-500 border border-red-100'
                                        : 'bg-blue-50 text-blue-500 border border-blue-100'
                                    }`}>
                                    {n.type.includes('CAMPAIGN') ? (
                                        <ArchiveBoxArrowDownIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                                    ) : n.type === 'REPORT' ? (
                                        <FlagIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2] text-red-500" />
                                    ) : (
                                        <BellIcon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-[13px] sm:text-sm leading-snug ${n.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                                        <span className="font-bold">{n.title}</span>
                                        {' '}
                                        <span className="font-normal">{n.message}</span>
                                    </p>
                                    <p className={`text-[11px] sm:text-xs mt-1.5 font-semibold ${n.isRead ? 'text-gray-400' : 'text-[#2ba6e1]'}`}>
                                        {formatRelativeTime(n.createdAt)}
                                    </p>
                                </div>

                                {/* Right side: unread dot or mark-as-read */}
                                <div className="shrink-0 flex items-center mt-3">
                                    {n.isRead ? (
                                        <CheckIcon className="w-4 h-4 text-gray-300" />
                                    ) : (
                                        <div className="w-3 h-3 rounded-full bg-[#2ba6e1] shadow-sm shadow-blue-500/30" />
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 py-6 flex-wrap">
                                {getPageNumbers(currentPage, totalPages).map((item, idx) =>
                                    typeof item === 'number' ? (
                                        <button
                                            key={idx}
                                            onClick={() => handlePageChange(item)}
                                            className={`
                                                w-9 h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                                                ${currentPage === item
                                                    ? "bg-[#2ba6e1] text-white shadow-md"
                                                    : "bg-white/50 text-gray-500 hover:bg-white border border-white/50"
                                                }
                                            `}
                                        >
                                            {item}
                                        </button>
                                    ) : (
                                        <span key={idx} className="px-1 text-gray-400">…</span>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
