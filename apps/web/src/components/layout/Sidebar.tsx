'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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

const TEAL = '#0891B2';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check if we came from another page via query param to keep its sidebar item active
  const fromParam = searchParams.get('from');
  const activePath = fromParam ? `/${fromParam}` : pathname;

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
    <nav className="flex-1 px-3 lg:px-4 space-y-0.5 mt-3">
      {items.map((item) => {
        const isActive = activePath === item.href || activePath.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`
              relative flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-[11px] rounded-xl transition-all duration-200
              ${isActive
                ? (isAdmin
                  ? 'bg-[#7598C1]/15 text-[#1d2951] font-semibold'
                  : 'bg-[#0891B2]/8 text-[#0891B2] font-semibold')
                : (isAdmin
                  ? 'text-gray-600 hover:text-[#1d2951] hover:bg-gray-100'
                  : 'text-gray-600 hover:text-[#0891B2] hover:bg-[#0891B2]/6')
              }
            `}
          >
            {isActive && (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full"
                style={{ backgroundColor: isAdmin ? '#1d2951' : TEAL }}
              />
            )}
            <item.icon
              className={`h-[18px] w-[18px] lg:h-5 lg:w-5 shrink-0 transition-colors duration-200 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.6]'}`}
              style={isActive && !isAdmin ? { color: TEAL } : undefined}
            />
            <span className="text-[15px] lg:text-[16px] tracking-[-0.01em] leading-tight">{item.name}</span>
          </Link>
        );
      })}

      {/* Logout button - Only show for Admin if needed, or hide if moved to header */}
      {isAdmin && (
        <div className="mt-6 pt-4 mx-1 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`
              w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-[11px] rounded-xl transition-all duration-200
              text-red-500 hover:text-red-500 hover:bg-red-50
              disabled:opacity-50
            `}
          >
            <ArrowRightOnRectangleIcon className="h-[18px] w-[18px] lg:h-5 lg:w-5 shrink-0 stroke-[1.6]" />
            <span className="text-[13px] lg:text-[14px] font-medium tracking-[-0.01em]">
              {isLoggingOut ? translate('sidebar.logging_out') : translate('header.logout')}
            </span>
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
          transition-all duration-300 z-30 bg-white border-r border-gray-200/80
          ${isOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
        `}
        style={{ top: 'var(--header-h)' }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-1 pb-4">
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
        <div className="flex items-center justify-between px-5 border-b border-gray-100" style={{ height: 'var(--header-row-h)' }}>
          <span className="text-sm font-bold text-gray-800 tracking-tight uppercase">
            {roleLabel || 'Menu'}
          </span>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
