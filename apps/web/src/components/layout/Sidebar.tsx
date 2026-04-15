'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  HomeIcon,
  HeartIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  WalletIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { API_BASE_URL } from '@/lib/constants/endpoints';

export interface MenuItem {
  name: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.FC<any>;
}

/** Default navigation for regular users */
export const userMenuItems: MenuItem[] = [
  { name: 'Home', href: '/home', icon: HomeIcon },
  { name: 'Favorite Campaigns', href: '/favorites', icon: HeartIcon },
  { name: 'Activity History', href: '/activity', icon: ClockIcon },
  { name: 'Joined Campaigns', href: '/joined', icon: UserGroupIcon },
  { name: 'My Campaigns', href: '/creator/campaigns', icon: DocumentTextIcon },
  { name: 'List campaigns', href: '/list', icon: Bars3BottomLeftIcon },
  { name: 'Wallet', href: '/wallet', icon: WalletIcon },
  { name: 'Setting', href: '/settings', icon: Cog6ToothIcon },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  /** Override the default user menu with a custom list (e.g. admin menu) */
  menuItems?: MenuItem[];
  /** Optional role label shown at the top of the sidebar (e.g. 'ADMIN') */
  roleLabel?: string;
  /** Optional class to override the top spacer height (defaults to h-[104px]) */
  topSpacerClass?: string;
}

export default function Sidebar({ isOpen, onClose, menuItems, roleLabel }: SidebarProps) {

  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Use provided menuItems or fall back to default user menu
  const items = menuItems ?? userMenuItems;
  const isAdmin = roleLabel === 'ADMIN' || roleLabel === 'SUPER ADMIN';
  const { translate } = useAdminLanguage();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const refreshToken = localStorage.getItem('refreshToken');
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
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsLoggingOut(false);
      if (pathname.startsWith('/admin') || isAdmin) {
        router.push('/admin/login');
      } else {
        router.push('/login');
      }
    }
  };

  /** Shared nav content used by both desktop and mobile sidebar */
  const renderNavItems = (onItemClick?: () => void) => (
    <nav className="flex-1 px-3 lg:px-4 space-y-1.5 lg:space-y-2 mt-2">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`
              relative flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base rounded-xl transition-all border
              ${isActive
                ? (isAdmin
                  ? 'bg-[#7598C1]/30 text-gray-900 border border-[#7598C1]/40 backdrop-blur-md'
                  : 'bg-[#AFF1FF]/30 text-[#47c9e5] font-medium border border-[#AFF1FF]/80 backdrop-blur-md')
                : (isAdmin
                  ? 'bg-white text-gray-700 border-transparent hover:text-gray-900 hover:border-[#7598C1] hover:shadow-[inset_0_0_12px_rgba(117,152,193,0.3),0_0_15px_rgba(117,152,193,0.4)]'
                  : 'bg-white text-gray-700 font-medium border-transparent hover:text-[#47c9e5] hover:border-[#47c9e5] hover:shadow-[inset_0_0_12px_rgba(71,201,229,0.3),0_0_15px_rgba(71,201,229,0.4)]')
              }
            `}
          >
            {isActive && (
              <div className={`absolute -left-3 lg:-left-4 top-1/2 -translate-y-1/2 w-1 lg:w-1.5 h-6 lg:h-8 ${isAdmin ? 'bg-[#1d2951]' : 'bg-[#47c9e5]'} rounded-r-full`} />
            )}
            <item.icon className={`mr-3 lg:mr-4 h-5 w-5 lg:h-6 lg:w-6 ${isActive ? 'stroke-2' : ''}`} />
            {item.name}
          </Link>
        );
      })}

      {/* Logout button - Only show for Admin if needed, or hide if moved to header */}
      {isAdmin && (
        <div className="mt-4 pb-4">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              w-full flex items-center px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base rounded-xl transition-all border
              text-gray-900 font-medium border-transparent 
              hover:border-red-400 hover:ring-2 hover:ring-red-100 hover:bg-white hover:text-red-600 hover:shadow-sm
              disabled:opacity-50
            `}
          >
            <ArrowRightOnRectangleIcon className="mr-3 lg:mr-4 h-5 w-5 lg:h-6 lg:w-6 stroke-2" />
            {isLoggingOut ? translate('sidebar.logging_out') : translate('header.logout')}
          </button>
        </div>
      )}
    </nav>
  );

  return (
    <>
      {/* ── Desktop/Laptop Sidebar ── */}
      <aside
        className={`
          hidden md:fixed md:bottom-0 md:left-0 md:flex md:w-64 md:flex-col
          transition-all duration-300 z-30 bg-white border-r border-gray-200
          ${isOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
        `}
        style={{ top: 'var(--header-h)' }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4">
          {renderNavItems()}
        </div>
      </aside>

      {/* ── Mobile Sidebar Drawer ── */}
      {/* Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`
          md:hidden fixed top-0 left-0 bottom-0 w-[280px] max-w-[80vw]
          bg-white shadow-2xl z-50 flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 border-b border-gray-100" style={{ height: 'var(--header-row-h)' }}>
          <span className="text-base font-black text-gray-800 tracking-tight">
            {roleLabel || 'Menu'}
          </span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 stroke-2" />
          </button>
        </div>

        {/* Drawer Navigation - auto close on click */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-4">
          {renderNavItems(onClose)}
        </div>
      </aside>
    </>
  );
}
