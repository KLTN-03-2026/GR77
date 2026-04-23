'use client';

import '@fontsource/allura';
import { BellIcon, Bars3Icon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Logo from '@/components/common/logo';
import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  UserCircleIcon,
  GlobeAltIcon,
  MoonIcon,
  Cog6ToothIcon as CogIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';

import NotificationBell from './NotificationBell';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { useGlobalAuth } from '@/contexts/AuthContext';
import { API_BASE_URL } from '@/lib/constants/endpoints';
import UserAvatar from '@/components/common/UserAvatar';

interface HeaderProps {
  onToggleSidebar: () => void;
  isOpen: boolean;
  roleLabel?: string;
}

export default function Header({ onToggleSidebar, isOpen, roleLabel }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { translate } = useAdminLanguage();
  const { user, logout } = useGlobalAuth();

  // ── Mobile auto-hide header on scroll ──
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollThreshold = 10; // minimum scroll distance before toggling

  useEffect(() => {
    const isMobile = () => window.innerWidth < 768;

    const handleScroll = () => {
      if (!isMobile()) {
        setHeaderVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) < scrollThreshold) return;

      if (delta > 0 && currentScrollY > 80) {
        // Scrolling DOWN → hide header
        setHeaderVisible(false);
      } else if (delta < 0) {
        // Scrolling UP → show header
        setHeaderVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const userName = [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(' ') || user?.username || 'User';
  const userAvatar = user?.profile?.avatarUrl;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    const isAdminLogout = pathname.startsWith('/admin') || roleLabel === 'ADMIN' || roleLabel === 'SUPER ADMIN';

    try {
      const refreshToken = localStorage.getItem(isAdminLogout ? 'adminRefreshToken' : 'refreshToken');
      if (refreshToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      if (isAdminLogout) {
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('adminUserName');
      } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('userAvatar');
      }
      setIsLoggingOut(false);
      setIsProfileOpen(false);
      if (isAdminLogout) {
        router.push('/admin/login');
      } else {
        router.push('/login');
      }
    }
  };

  const isAdmin = roleLabel === 'ADMIN' || roleLabel === 'SUPER ADMIN';

  // Render breadcrumbs based on pathname
  const renderBreadcrumbs = () => {
    if (pathname.includes('/creator/campaigns/new')) {
      return (
        <>
          <Link href="/home" className="hover:text-blue-600">Home</Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" strokeWidth={3} />
          <Link href="/creator/campaigns" className="hover:text-blue-600">My Campaigns</Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" strokeWidth={3} />
          <span className="text-gray-900 font-medium">Add</span>
        </>
      );
    }

    if (pathname.includes('/creator/campaigns') && pathname.includes('/edit')) {
      return (
        <>
          <Link href="/creator/campaigns" className="hover:text-blue-600">My Campaigns</Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" strokeWidth={3} />
          <span className="text-gray-900 font-medium">Edit</span>
        </>
      );
    }

    if (pathname.startsWith('/creator/campaigns/') && !pathname.includes('/new')) {
      const parts = pathname.split('/');
      const campaignId = parts[parts.length - 1];
      const idx = searchParams.get('idx');
      return (
        <>
          <Link href="/creator/campaigns" className="hover:text-blue-600">My Campaigns</Link>
          <ChevronRightIcon className="h-3 w-3 mx-2" strokeWidth={3} />
          <span className="text-gray-900 font-medium">{idx ? `#${idx}` : `#${campaignId.length > 8 ? campaignId.slice(-4) : campaignId}`}</span>
        </>
      );
    }

    // Admin breadcrumbs
    if (pathname.includes('/admin/dashboard')) return <><span>{translate('menu.dashboard')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;
    if (pathname.includes('/admin/users')) return <><span>{translate('menu.users')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;
    if (pathname.includes('/admin/campaigns')) return <><span>{translate('menu.campaigns')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;
    if (pathname.includes('/admin/transactions')) return <><span>{translate('menu.transactions')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;
    if (pathname.includes('/admin/withdrawals')) return <><span>{translate('menu.withdrawals')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;
    if (pathname.includes('/admin/revenue')) return <><span>{translate('menu.revenue')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;
    if (pathname.includes('/admin/moderation')) return <><span>{translate('menu.moderation')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;
    if (pathname.includes('/admin/kyc')) return <><span>{translate('menu.kyc')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;
    if (pathname.includes('/admin/settings')) return <><span>{translate('menu.settings')}</span><ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} /></>;

    // Default user breadcrumbs
    let title = 'Home';
    if (pathname.includes('/home')) title = 'Home';
    else if (pathname.includes('/favorites')) title = 'Favorite Campaigns';
    else if (pathname.includes('/activity')) title = 'Activity History';
    else if (pathname.includes('/joined')) title = 'Joined Campaigns';
    else if (pathname.includes('/creator')) title = 'My Campaigns';
    else if (pathname.includes('/list')) title = 'All Campaigns';
    else if (pathname.includes('/wallet')) title = 'Wallet';
    else if (pathname.includes('/settings')) title = 'Setting';
    else if (pathname.includes('/notifications')) title = 'Notifications';

    return (
      <>
        <span>{title}</span>
        <ChevronRightIcon className="h-3 w-3 ml-2" strokeWidth={3} />
      </>
    );
  };

  return (
    <header
      className={`bg-white/70 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
    >
      {/* Top Row: Logo & Welcome area */}
      <div className="flex items-center justify-between" style={{ height: 'var(--header-row-h)' }}>
        <div className="flex items-center pl-0 pr-2 sm:px-6 shrink-0 md:w-64 border-r border-transparent h-full">
          <button
            onClick={onToggleSidebar}
            className="p-1 sm:p-2 -ml-0 sm:-ml-2 text-gray-900 hover:bg-gray-100 rounded-lg transition-colors mr-1 sm:mr-1 lg:mr-2 flex-shrink-0"
          >
            <Bars3Icon className="h-6 w-6 stroke-2" />
          </button>

          <Link href={isAdmin ? "/admin/dashboard" : "/home"} className="transition-transform hover:scale-105 shrink-0 flex items-center h-full -ml-1 sm:-ml-0">
            <Logo
              variant={isAdmin ? 'admin' : 'default'}
              className="object-contain w-[120px] sm:w-44 h-10 sm:h-14"
            />
          </Link>
        </div>

        {/* Support/Welcome & Actions Area: Aligns with main content */}
        <div className="flex-1 flex items-center justify-between sm:justify-between justify-end px-3 sm:px-6 lg:px-8 h-full min-w-0">
          <p className="hidden sm:block text-gray-800 text-[11px] sm:text-lg md:text-2xl lg:text-3xl truncate min-w-0 flex-1 ml-1 sm:ml-2" style={{ fontFamily: 'Allura, cursive' }}>
            {isAdmin ? translate('header.welcome') : 'Welcome back,'}{' '}
            <span
              style={{
                color: isAdmin ? '#24305E' : '#F6349B',
                fontWeight: 'bold'
              }}
            >
              {userName}
            </span>
            <span className="hidden md:inline">{isAdmin ? translate('header.ready') : '. Ready to create impact today?'}</span>
          </p>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0 ml-4">
            {/* Notification icon */}
            <NotificationBell isAdmin={isAdmin} />

            {/* Profile Dropdown - Only show for regular users */}
            {!isAdmin && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center justify-center transition-all"
                >
                  <UserAvatar src={userAvatar} role={user?.role} className="sm:scale-x-110 sm:scale-y-110" />
                </button>


                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header: User Info - Compact */}
                    <div className="px-5 py-4 flex items-center gap-3">
                      <UserAvatar src={userAvatar} role={user?.role} size="md" />
                      <div className="overflow-hidden">
                        <p className="text-base font-bold text-[#1d2951] truncate leading-tight">{userName}</p>
                        <p className="text-xs font-medium text-[#8ea1c1] truncate mt-0.5">{user?.email}</p>
                      </div>
                    </div>


                    <div className="border-t border-gray-50"></div>

                    {/* Body: Application Settings - Compact */}
                    <div className="py-2">
                      <p className="px-5 py-2 text-[10px] font-black text-[#8ea1c1] uppercase tracking-[0.1em]">Application</p>

                      <div className="px-2">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-50 transition-colors group"
                        >
                          <div className="p-1.5 rounded-xl bg-gray-50 group-hover:bg-white transition-colors">
                            <UserCircleIcon className="h-5 w-5 text-[#8ea1c1]" />
                          </div>
                          <span className="flex-1 text-left text-sm font-bold text-[#1d2951]">My Profile</span>
                          <ChevronRightIcon className="h-3.5 w-3.5 text-[#8ea1c1]" strokeWidth={3} />
                        </Link>

                        <Link
                          href="/security"
                          onClick={() => setIsProfileOpen(false)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-gray-50 transition-colors group"
                        >
                          <div className="p-1.5 rounded-xl bg-gray-50 group-hover:bg-white transition-colors">
                            <ShieldCheckIcon className="h-5 w-5 text-[#8ea1c1]" />
                          </div>
                          <span className="flex-1 text-left text-sm font-bold text-[#2068fd]">Security</span>
                          <ChevronRightIcon className="h-3.5 w-3.5 text-[#8ea1c1]" strokeWidth={3} />
                        </Link>
                      </div>
                    </div>

                    {/* Footer: Logout - Styled but Compact */}
                    <div className="mt-1">
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex w-full items-center gap-3 px-5 py-3 bg-[#fff5f5] text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"

                      >
                        <LogoutIcon className="h-5 w-5 stroke-2" />
                        <span className="text-base font-bold">{isLoggingOut ? translate('sidebar.logging_out') : translate('header.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Breadcrumb row: Stays below top row, aligns with content */}
      <div className={`bg-transparent border-t border-gray-50 px-3 sm:px-6 lg:px-8 flex items-center transition-all duration-300 ${isOpen ? 'lg:ml-64' : 'lg:ml-0'}`} style={{ height: 'var(--header-crumb-h)' }}>
        <div className="flex items-center text-xs sm:text-sm text-gray-500 font-medium tracking-wide">
          {renderBreadcrumbs()}
        </div>
      </div>
    </header>
  );
}

