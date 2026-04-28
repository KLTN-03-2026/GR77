'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckIcon, EllipsisHorizontalIcon, ArchiveBoxArrowDownIcon } from '@heroicons/react/24/outline';
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
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationBell({ isAdmin }: { isAdmin?: boolean }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [showOptions, setShowOptions] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            if (typeof window === 'undefined') return;
            const token = isAdmin ? localStorage.getItem('adminAccessToken') : localStorage.getItem('accessToken');
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setNotifications(data);
                } else {
                    console.error('Expected array of notifications, got:', data);
                    setNotifications([]);
                }
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowOptions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id: string) => {
        try {
            const token = isAdmin ? localStorage.getItem('adminAccessToken') : localStorage.getItem('accessToken');
            await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (err) {
            console.error('Failed to mark as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const token = isAdmin ? localStorage.getItem('adminAccessToken') : localStorage.getItem('accessToken');
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setShowOptions(false);
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    // Normalize old notification links (e.g. /campaigns/id -> /home/id)
    const normalizeLink = (link: string) => {
        // /campaigns/UUID (without /creator/ prefix) -> /home/UUID
        const match = link.match(/^\/campaigns\/([a-f0-9-]+)$/i);
        if (match) return `/home/${match[1]}`;
        // /my-campaigns -> /creator/campaigns
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
            setIsOpen(false);
        }
    };

    // Filter notifications based on selected tab
    const displayed = filter === 'unread'
        ? notifications.filter(n => !n.isRead)
        : notifications;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => {
                    // On mobile, navigate directly to the notifications page
                    if (window.innerWidth < 768) {
                        router.push(isAdmin ? '/admin/notifications' : '/notifications');
                        return;
                    }
                    setIsOpen(!isOpen);
                }}
                className={`relative p-2 sm:p-2.5 rounded-xl sm:rounded-2xl transition-all duration-300 transform active:scale-90 aspect-square flex items-center justify-center ${isAdmin
                    ? 'bg-[#89A7CA] text-white hover:bg-[#7598c1] shadow-lg shadow-blue-900/10'
                    : 'bg-[#0891B2]/10 text-[#0891B2] hover:bg-[#0891B2]/15'
                    }`}
            >
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 sm:h-[22px] min-w-[16px] sm:min-w-[22px] items-center justify-center rounded-full border-2 sm:border-[3px] border-white bg-red-500 px-0.5 sm:px-1 text-[8px] sm:text-[10px] font-black text-white leading-none animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-[clamp(270px,85vw,320px)] max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] flex flex-col">
                    <div className="px-4 pt-3 pb-2">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-extrabold text-gray-900">Notifications</h3>
                            <div className="relative">
                                <button
                                    onClick={() => setShowOptions(!showOptions)}
                                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                                >
                                    <EllipsisHorizontalIcon className="w-5 h-5" strokeWidth={2} />
                                </button>

                                {/* Options mini-dropdown */}
                                {showOptions && (
                                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                                        <button
                                            onClick={markAllAsRead}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <CheckIcon className="w-4 h-4 text-gray-400" /> Mark all as read
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === 'all'
                                    ? 'bg-[#0891B2]/10 text-[#0891B2]'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setFilter('unread')}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${filter === 'unread'
                                    ? 'bg-[#0891B2]/10 text-[#0891B2]'
                                    : 'text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                Unread
                            </button>
                        </div>
                    </div>

                    {/* ── Section Label ── */}
                    {displayed.length > 0 && (
                        <div className="px-4 pt-3 pb-1 flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-900">
                                {filter === 'unread' ? 'Unread' : 'Recent'}
                            </span>
                            <button
                                onClick={() => { setIsOpen(false); router.push(isAdmin ? '/admin/notifications' : '/notifications'); }}
                                className="text-xs font-semibold text-[#0891B2] hover:underline transition-colors"
                            >
                                See all
                            </button>
                        </div>
                    )}

                    {/* ── Notification List ── */}
                    <div className="flex-1 min-h-0 overflow-y-auto">
                        {displayed.length > 0 ? (
                            <div>
                                {displayed.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${n.isRead
                                            ? 'hover:bg-gray-50'
                                            : 'bg-[#0891B2]/5 hover:bg-[#0891B2]/8'
                                            }`}
                                    >
                                        {/* Avatar / Icon */}
                                        <div className={`shrink-0 w-9 h-9 rounded-2xl flex items-center justify-center ${n.type.includes('CAMPAIGN')
                                            ? 'bg-orange-50 text-orange-500'
                                            : 'bg-blue-50 text-blue-500'
                                            }`}>
                                            {n.type.includes('CAMPAIGN') ? <ArchiveBoxArrowDownIcon className="w-4 h-4 stroke-[2]" /> : <BellIcon className="w-4 h-4 stroke-[2]" />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs leading-snug ${n.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                                                <span className="font-bold">{n.title}</span>
                                                {' '}
                                                <span className="font-normal">{n.message}</span>
                                            </p>
                                            <p className={`text-[10px] mt-0.5 font-semibold ${n.isRead ? 'text-gray-400' : 'text-[#0891B2]'}`}>
                                                {formatRelativeTime(n.createdAt)}
                                            </p>
                                        </div>

                                        {/* Unread dot */}
                                        {!n.isRead && (
                                            <div className="shrink-0 mt-4">
                                                <div className="w-3 h-3 rounded-full bg-[#0891B2]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center text-gray-300">
                                <BellIcon className="w-10 h-10 mb-3 opacity-30" />
                                <p className="font-semibold text-sm text-gray-400">
                                    {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
