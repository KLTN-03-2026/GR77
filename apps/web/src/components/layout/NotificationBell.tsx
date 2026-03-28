'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckIcon, ArchiveBoxArrowDownIcon, EllipsisHorizontalIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

export default function NotificationBell({ isAdmin }: { isAdmin?: boolean }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const token = isAdmin ? localStorage.getItem('adminAccessToken') : localStorage.getItem('accessToken');
            if (!token) return;

            const res = await fetch('http://localhost:3001/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
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
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id: string) => {
        try {
            const token = isAdmin ? localStorage.getItem('adminAccessToken') : localStorage.getItem('accessToken');
            await fetch(`http://localhost:3001/notifications/${id}/read`, {
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
            await fetch('http://localhost:3001/notifications/read-all', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error('Failed to mark all as read', err);
        }
    };

    const handleNotificationClick = (n: Notification) => {
        if (!n.isRead) markAsRead(n.id);
        if (n.link) {
            router.push(n.link);
            setIsOpen(false);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' • ' + date.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2.5 rounded-2xl transition-all duration-300 transform active:scale-90 ${isAdmin
                    ? 'bg-[#89A7CA] text-white hover:bg-[#7598c1] shadow-lg shadow-blue-900/10'
                    : 'bg-[#E0F0FA] text-[#2ba6e1] hover:bg-[#d4ebfc]'
                    }`}
            >
                <BellIcon className="h-6 w-6" strokeWidth={2} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-[22px] min-w-[22px] items-center justify-center rounded-full border-[3px] border-white bg-red-500 px-1 text-[10px] font-black text-white leading-none animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-4 w-96 bg-white rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="px-6 py-5 bg-gray-50/50 border-b flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight uppercase">Notifications</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time Intel Feed</p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-[10px] font-black text-blue-600 uppercase hover:text-blue-800 transition-colors flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full"
                            >
                                <CheckIcon className="w-3 h-3 stroke-[3]" /> Clear All
                            </button>
                        )}
                    </div>

                    <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((n) => (
                                    <div
                                        key={n.id}
                                        onClick={() => handleNotificationClick(n)}
                                        className={`px-6 py-5 cursor-pointer transition-all flex gap-4 border-l-4 ${n.isRead
                                            ? 'opacity-60 border-transparent grayscale-[0.5] hover:bg-gray-50'
                                            : 'bg-blue-50/30 border-blue-500 hover:bg-blue-50/60'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 rounded-[1.2rem] shrink-0 flex items-center justify-center shadow-sm ${n.type.includes('CAMPAIGN') ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'
                                            }`}>
                                            {n.type.includes('CAMPAIGN') ? <ArchiveBoxArrowDownIcon className="w-6 h-6" /> : <BellIcon className="w-6 h-6" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className={`text-sm font-black truncate ${n.isRead ? 'text-gray-600' : 'text-gray-900 underline decoration-blue-500/30 underline-offset-4'}`}>
                                                    {n.title}
                                                </p>
                                                {!n.isRead && <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />}
                                            </div>
                                            <p className="text-xs font-medium text-gray-500 line-clamp-2 leading-relaxed mb-3">
                                                {n.message}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                                <CalendarIcon className="w-3 h-3" />
                                                {formatTime(n.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 flex flex-col items-center justify-center text-gray-300">
                                <BellIcon className="w-16 h-16 mb-4 opacity-10" />
                                <p className="font-black uppercase tracking-widest text-xs">Awaiting Activity...</p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-gray-50/50 border-t flex items-center justify-center">
                        <button
                            onClick={() => { setIsOpen(false); router.push('/notifications'); }}
                            className="text-[10px] font-black text-gray-400 uppercase hover:text-gray-900 transition-colors tracking-[0.2em] flex items-center gap-2"
                        >
                            <EllipsisHorizontalIcon className="w-5 h-5" /> See all notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
